"""
Automated unit and integration tests for Customer Support Resolution Assistant (TRACK_ID=PS04).
Tests:
1. Local Hybrid Retriever accuracy.
2. Deterministic safety heuristics across all 3 pathways (Routine, Clarify, Handover).
3. Fallback resolution robustness.
4. FastAPI endpoints (/api/health, /api/articles, /api/resolve).
"""

import unittest
import json
from src.backend.models import (
    CustomerAccount, ConversationMessage, ResolveRequest, TriageResult
)
from src.backend.retrieval import LocalRetriever
from src.backend.heuristics import evaluate_deterministic_rules
from app import app
from fastapi.testclient import TestClient

class TestResolutionAssistant(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        with open("data/support_articles.json", "r", encoding="utf-8") as f:
            cls.articles = json.load(f)
        with open("data/customers.json", "r", encoding="utf-8") as f:
            cls.customers = json.load(f)

    def test_health_endpoint(self):
        """Verify GET /api/health returns 200 OK and valid metadata."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["trackId"], "PS04")
        self.assertIn("retrievalEngine", data)

    def test_local_retriever(self):
        """Verify local vector retriever retrieves accurate articles without external services."""
        retriever = LocalRetriever()
        
        # Test 1: Roaming query
        results = retriever.search("unexpected roaming charge on ferry trip", top_k=1)
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]["id"], "KB-BIL-201")

        # Test 2: ONT light query
        results = retriever.search("small white box on wall has flashing light", top_k=1)
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]["id"], "KB-BB-101")

        # Test 3: Wi-Fi speed query
        results = retriever.search("bedroom wifi slow 35 mbps 500mbps plan", top_k=1)
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]["id"], "KB-BB-102")

        # Test 4: Churn and repeat faults query
        results = retriever.search("third router failed rains cancel contract compensation", top_k=1)
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]["id"], "KB-RET-401")

    def test_pathway_1_routine_wifi(self):
        """Verify Routine Wi-Fi speed resolution drafts grounded response with KB-BB-102 citation."""
        customer = self.customers["cust_sarah_chen"]
        conversation = [
            {"sender": "customer", "text": "Hi, I pay for the Full Fibre 500Mbps package, but when I'm working from my upstairs bedroom on my laptop, I only get around 35 to 40 Mbps. Is there an issue with my line?"}
        ]
        result = evaluate_deterministic_rules(conversation, customer, self.articles)
        self.assertEqual(result.mode, "routine")
        self.assertEqual(result.matchingArticle.id, "KB-BB-102")
        self.assertIsNotNone(result.draftResponse)
        self.assertIn("Mesh", result.draftResponse)
        self.assertIn("Sarah Chen", result.draftResponse)

    def test_pathway_2_clarify_missing_ont_details(self):
        """Verify Missing Information pathway triggers when ONT light label/color is not stated."""
        customer = self.customers["cust_david_miller"]
        conversation = [
            {"sender": "customer", "text": "Hello, my internet completely cut out. The main router has an orange light, and on the small white box screwed to the wall, there's a flashing light. What should I do?"}
        ]
        result = evaluate_deterministic_rules(conversation, customer, self.articles)
        self.assertEqual(result.mode, "clarify")
        self.assertEqual(result.matchingArticle.id, "KB-BB-101")
        self.assertIsNotNone(result.clarificationPrompt)
        self.assertTrue(len(result.clarificationPrompt.missingFields) >= 2)
        self.assertIn("PON", result.clarificationPrompt.questionToCustomer)
        self.assertIn("LOS", result.clarificationPrompt.questionToCustomer)

    def test_pathway_3_complex_handover_directive_co77(self):
        """Verify Directive CO-77 triggers zero-context-loss Handover Dossier for repeat fault + rain + churn."""
        customer = self.customers["cust_marcus_vance"]
        conversation = [
            {"sender": "customer", "text": "You sent me a 3rd replacement router last week. It started raining heavily this morning and my connection dropped 19 times. I lost deliverables. I will NOT restart another router. I want this contract cancelled immediately with zero termination penalty and compensation."}
        ]
        result = evaluate_deterministic_rules(conversation, customer, self.articles)
        self.assertEqual(result.mode, "handover")
        self.assertEqual(result.matchingArticle.id, "KB-RET-401")
        self.assertIsNotNone(result.handoverDossier)
        self.assertEqual(result.handoverDossier.priority, "Urgent / Critical")
        self.assertTrue(len(result.handoverDossier.establishedFacts) >= 3)
        self.assertTrue(len(result.handoverDossier.attemptedSteps) >= 2)
        self.assertIn("OTDR", result.handoverDossier.recommendedNextAction)

    def test_api_resolve_endpoint(self):
        """Verify POST /api/resolve returns structured, validated JSON conforming to TriageResult."""
        customer = self.customers["cust_emma_watson"]
        payload = {
            "conversation": [
                {"id": "1", "sender": "customer", "text": "Why is my bill $75 instead of usual $55? Disputing roaming fee from local ferry trip."}
            ],
            "customer": customer,
            "articles": self.articles
        }
        response = self.client.post("/api/resolve", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("mode", data)
        self.assertEqual(data["mode"], "routine")
        self.assertEqual(data["matchingArticle"]["id"], "KB-BIL-201")
        self.assertIn("credit", data["draftResponse"].lower())

if __name__ == "__main__":
    unittest.main()
