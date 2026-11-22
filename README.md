# Autonomous WhatsApp AI Agent for E-Commerce

A capstone project: an autonomous WhatsApp shopping assistant powered by
Gemini 2.5 with multi-tool calling, backed by a FastAPI + SQLite store.

## Architecture

1. **Ingress** – WhatsApp via Neonize (QR pairing, per-phone session isolation).
2. **Reasoner** – Gemini 2.5 agent with automatic multi-tool calling.
3. **Tools** – 10 Python functions in `tools.py` bridging to the FastAPI backend.
4. **Backend** – FastAPI + SQLAlchemy + SQLite (products, cart, orders).

## Project Layout

```
ecommerce-whatsapp-agent/
├── backend/            # FastAPI store (main.py, models.py, schemas.py, database.py, seed_data.py)
├── tools.py            # 10 tool functions with type hints + docstrings
├── agent.py            # Gemini agent + per-phone sessions
├── bot.py              # Live WhatsApp bot (Neonize)
├── simulate_chat.py    # Terminal chat simulator
├── requirements.txt
├── .env.example
└── README.md
```

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# edit .env and set GEMINI_API_KEY
```

### 3. Seed the database

```bash
cd backend
python seed_data.py
cd ..
```

### 4. Run the backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test with the terminal simulator

```bash
python simulate_chat.py
```

Example multi-tool message:

> Good evening, check if Mechanical Keyboard and Wireless Gaming Mouse are in stock, add one of each to my cart, and checkout to Cairo - Maadi.

### 6. Run the live WhatsApp bot

```bash
python bot.py
```

Scan the printed QR code with WhatsApp. Sessions are isolated per phone number.

## Tools

| # | Tool | Responsibility |
|---|------|----------------|
| 1 | `list_categories()` | List all store categories |
| 2 | `search_products(keyword, category_id, in_stock_only)` | Search products |
| 3 | `get_product_details(product_id)` | Product specs/price/stock |
| 4 | `get_customer_cart(customer_name)` | View cart + total |
| 5 | `add_item_to_cart(customer_name, product_id, quantity)` | Add to cart |
| 6 | `remove_cart_item(item_id)` | Remove a cart line |
| 7 | `clear_customer_cart(customer_name)` | Empty cart |
| 8 | `checkout_cart(customer_name, shipping_address)` | Place order, deduct stock |
| 9 | `track_order(order_id)` | Order status |
| 10 | `cancel_order(order_id)` | Cancel + restore stock |

## Notes

- Gemini client is initialized with `http_options={"api_version": "v1beta"}` (required for function calling).
- Zero-hallucination: the agent must call backend tools before stating prices/stock/orders.
- `.env` and `*.db` are gitignored.
