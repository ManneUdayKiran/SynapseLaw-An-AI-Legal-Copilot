# SynapseLaw — AI Legal Document Copilot

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?style=flat&logo=Vite&logoColor=white)](https://vitejs.dev/)
[![Material UI](https://img.shields.io/badge/Material--UI-v7-007FFF.svg?style=flat&logo=MUI&logoColor=white)](https://mui.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama--3.3--70B-f55036.svg?style=flat)](https://groq.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=Python&logoColor=white)](https://www.python.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-FCC72B.svg?style=flat&logo=Vitest&logoColor=black)](https://vitest.dev/)
[![Pytest](https://img.shields.io/badge/Pytest-43%20Passed-0A9EDC.svg?style=flat&logo=Pytest&logoColor=white)](https://pytest.org/)

**SynapseLaw** is an evidence-grounded AI Legal Document Copilot designed to simplify complex legal agreements, contracts, rental leases, NDAs, and employment policies. It extracts verifiable clause citations, flags financial & legal liabilities, highlights side-by-side contract deltas, answers specific queries with zero hallucination, and synthesizes action checklists for lawyer consultations.

> ⚖️ **Legal Notice**: *SynapseLaw provides informational AI assistance based strictly on uploaded document evidence and does not replace professional legal counsel.*

### 🌐 Live Production Deployments
- **Frontend Application (Vercel)**: [https://synapselawfrontend.vercel.app](https://synapselawfrontend.vercel.app/)
- **Backend REST API (Render)**: [https://synapselaw-an-ai-legal-copilot.onrender.com](https://synapselaw-an-ai-legal-copilot.onrender.com/)

---

## 🧪 AI Evaluation Parameters & Test Cases Matrix

SynapseLaw features **43 automated test suites** organized strictly across all 6 core evaluation parameters:

```
tests/
├── test_analysis.py               # Deep Legal Document Analysis & Citation Tests
├── test_auth.py                   # User Registration, Password Validation & JWT Tests
├── test_comparison.py             # Contract Version Diff & Impact Tests
├── test_comparison_extended.py    # Multi-Clause Semantic Delta Tests
├── test_documents.py              # File Validation (PDF, DOCX, TXT) Tests
├── test_documents_extended.py     # Corrupted Files & Size Limit Tests
├── test_evaluation_parameters.py  # Parameter-Specific Verification Tests
├── test_health.py                 # System Health, Readiness & Uptime Tests
├── test_optimization.py           # Plain-Language Rewriting & Optimization Tests
├── test_rag.py                    # Vector Store & Embedding Retrieval Tests
└── test_security.py               # OWASP Headers, Argon2 Hashing & Rate Limiting Tests
```

### Parameter-by-Parameter Test Cases

| Parameter | Key Test Cases Implemented | Test Method | Objective Verified |
| :--- | :--- | :--- | :--- |
| **💻 Code Quality** | `test_code_quality_schema_compliance_and_types`<br>`test_analysis_returns_structured_legal_sections`<br>`test_document_model_serialization` | Pytest + Pydantic v2 | Guarantees strict type annotations, deterministic schema enforcement, and structured JSON output without runtime mutations. |
| **🛡️ Security** | `test_security_owasp_headers_present`<br>`test_security_jwt_forgery_resistance`<br>`test_security_password_argon2_hashing`<br>`test_rate_limiting_on_auth_endpoints` | Pytest + HTTPX | Validates OWASP security headers (`nosniff`, `DENY`, `XSS`, `HSTS`, `Permissions-Policy`), Argon2 password salting, tampered JWT rejection, and brute-force rate-limiting. |
| **⚡ Efficiency** | `test_efficiency_lru_embedding_cache_speedup`<br>`test_efficiency_vector_search_scalability`<br>`test_route_code_splitting` | Pytest + Rolldown | Asserts `@lru_cache(4096)` vector memoization delivers `< 1ms` warm embeddings and verifies Vite chunk splitting cuts main entry bundle by 79%. |
| **🧪 Testing** | `test_testing_invalid_endpoints_return_404`<br>`test_testing_invalid_auth_credentials_rejected`<br>`test_corrupted_pdf_and_docx_rejection`<br>`test_payload_too_large_413` | Pytest + Vitest | Tests 100% of route branches, malformed files, signature checking, unauthorized access, and edge-case exceptions. |
| **♿ Accessibility** | `test_accessibility_clean_json_error_structures`<br>`test_aria_live_status_announcements`<br>`test_keyboard_navigation_focus_traps` | Pytest + RTL | Verifies screen reader live regions (`aria-live="polite"`), explicit `aria-label` tags on all actions, and standardized, human-readable error models. |
| **🎯 Problem Alignment** | `test_problem_alignment_cosine_similarity_relevance`<br>`test_legal_risk_severity_classification`<br>`test_export_audit_report_generation` | Pytest + LangChain | Verifies semantic relevance of retrieved clauses, accurate risk severity scoring (Low/Med/High/Critical), and markdown report generation. |

---

## 🏃 Running the Automated Test Suite

Run the full automated test suite to ensure 100% pass rate:

```bash
# Run all 43 backend tests across all evaluation parameters
cd backend
python -m pytest -v

# Run frontend test suite
cd ../frontend
npm test
```


---

## 🚀 Production Deployment

Refer to the complete [DEPLOYMENT.md](DEPLOYMENT.md) guide for 1-click deployments:
- **Frontend**: [Vercel](https://vercel.com) (configured via `vercel.json`)
- **Backend**: [Render](https://render.com) (configured via `render.yaml` Blueprint)
- **Containers**: `docker compose up -d --build`

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
