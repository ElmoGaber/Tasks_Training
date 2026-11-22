"""Backend tool bridge for the WhatsApp e-commerce agent.

Each function below is a thin wrapper around the FastAPI store backend. They are
written with precise type hints and docstrings so that the Gemini SDK can derive
their function-calling schema automatically.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

import requests

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")


def _get(path: str, params: Optional[Dict[str, Any]] = None) -> Any:
    """Perform a GET request against the backend and return parsed JSON."""
    try:
        response = requests.get(f"{BACKEND_URL}{path}", params=params, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        return {"error": str(exc)}
    except ValueError:
        return {"error": "Invalid JSON response from backend"}


def _post(path: str, payload: Optional[Dict[str, Any]] = None) -> Any:
    """Perform a POST request against the backend and return parsed JSON."""
    try:
        response = requests.post(f"{BACKEND_URL}{path}", json=payload or {}, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        detail = ""
        if getattr(exc, "response", None) is not None:
            try:
                detail = exc.response.json().get("detail", "")
            except ValueError:
                detail = exc.response.text
        message = str(exc)
        if detail:
            message = f"{message} | {detail}"
        return {"error": message}
    except ValueError:
        return {"error": "Invalid JSON response from backend"}


def _put(path: str, payload: Optional[Dict[str, Any]] = None) -> Any:
    """Perform a PUT request against the backend and return parsed JSON."""
    try:
        response = requests.put(f"{BACKEND_URL}{path}", json=payload or {}, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        detail = ""
        if getattr(exc, "response", None) is not None:
            try:
                detail = exc.response.json().get("detail", "")
            except ValueError:
                detail = exc.response.text
        message = str(exc)
        if detail:
            message = f"{message} | {detail}"
        return {"error": message}
    except ValueError:
        return {"error": "Invalid JSON response from backend"}


def _delete(path: str) -> Any:
    """Perform a DELETE request against the backend and return parsed JSON."""
    try:
        response = requests.delete(f"{BACKEND_URL}{path}", timeout=15)
        response.raise_for_status()
        try:
            return response.json()
        except ValueError:
            return {"message": "Deleted successfully"}
    except requests.RequestException as exc:
        detail = ""
        if getattr(exc, "response", None) is not None:
            try:
                detail = exc.response.json().get("detail", "")
            except ValueError:
                detail = exc.response.text
        message = str(exc)
        if detail:
            message = f"{message} | {detail}"
        return {"error": message}


def list_categories() -> List[Dict[str, Any]]:
    """List all store categories available in the e-commerce backend.

    Use this when the customer asks what categories or departments the store has.

    Returns:
        A list of category objects, each containing id, name and description.
        Returns an error dict if the request fails.
    """
    result = _get("/categories")
    if isinstance(result, dict) and "error" in result:
        return result
    return result if isinstance(result, list) else [result]


def search_products(
    keyword: Optional[str] = None,
    category_id: Optional[int] = None,
    in_stock_only: bool = False,
) -> List[Dict[str, Any]]:
    """Search products in the store by name keyword, category, or stock status.

    Args:
        keyword: Optional name or keyword to search for (case-insensitive).
        category_id: Optional category id to filter products by.
        in_stock_only: If True, return only products that are currently in stock.

    Returns:
        A list of product objects with id, name, description, price, stock and
        category_id. Returns an error dict if the request fails.
    """
    params: Dict[str, Any] = {}
    if keyword:
        params["search"] = keyword
    if category_id is not None:
        params["category_id"] = category_id
    if in_stock_only:
        params["in_stock_only"] = True
    result = _get("/products", params=params or None)
    if isinstance(result, dict) and "error" in result:
        return result
    return result if isinstance(result, list) else [result]


def get_product_details(product_id: int) -> Dict[str, Any]:
    """Get full details for a single product by its id.

    Args:
        product_id: The unique id of the product.

    Returns:
        A product object with id, name, description, price, stock and
        category_id. Returns an error dict if not found.
    """
    return _get(f"/products/{product_id}")


def get_customer_cart(customer_name: str) -> Dict[str, Any]:
    """Retrieve the current shopping cart for a customer.

    Args:
        customer_name: The customer identifier (WhatsApp phone number or name).

    Returns:
        A cart summary with customer_name, items (each with id, product_name,
        unit_price, quantity, subtotal), total_items and total_price.
    """
    return _get(f"/cart/{customer_name}")


def add_item_to_cart(
    customer_name: str, product_id: int, quantity: int = 1
) -> Dict[str, Any]:
    """Add a quantity of a product to a customer's shopping cart.

    Args:
        customer_name: The customer identifier (WhatsApp phone number or name).
        product_id: The id of the product to add.
        quantity: How many units to add (defaults to 1).

    Returns:
        The created or updated cart line with id, product_name, unit_price,
        quantity and subtotal.
    """
    payload = {
        "customer_name": customer_name,
        "product_id": product_id,
        "quantity": quantity,
    }
    return _post("/cart/items", payload)


def remove_cart_item(item_id: int) -> Dict[str, Any]:
    """Remove a single line item from a shopping cart by its cart item id.

    Args:
        item_id: The id of the cart line item to remove.

    Returns:
        A confirmation message or an error dict.
    """
    return _delete(f"/cart/items/{item_id}")


def clear_customer_cart(customer_name: str) -> Dict[str, Any]:
    """Remove all items from a customer's shopping cart.

    Args:
        customer_name: The customer identifier (WhatsApp phone number or name).

    Returns:
        A confirmation message or an error dict.
    """
    return _delete(f"/cart/{customer_name}")


def checkout_cart(customer_name: str, shipping_address: str) -> Dict[str, Any]:
    """Finalize a customer's cart into an order and deduct stock.

    Args:
        customer_name: The customer identifier (WhatsApp phone number or name).
        shipping_address: The full shipping address for the order.

    Returns:
        The created order with id, customer_name, total_price, status and items.
    """
    payload = {
        "customer_name": customer_name,
        "shipping_address": shipping_address,
    }
    return _post("/orders/checkout", payload)


def track_order(order_id: int) -> Dict[str, Any]:
    """Track the status and contents of an order by its id.

    Args:
        order_id: The order id to look up.

    Returns:
        The order with id, customer_name, total_price, status and items.
    """
    return _get(f"/orders/{order_id}")


def cancel_order(order_id: int) -> Dict[str, Any]:
    """Cancel an active order and restore its quantities to stock.

    Args:
        order_id: The order id to cancel.

    Returns:
        The cancelled order with updated status, or an error dict.
    """
    return _put(f"/orders/{order_id}/cancel", {})
