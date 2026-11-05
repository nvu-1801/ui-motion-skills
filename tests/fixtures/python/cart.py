def total_cents(unit_cents, quantity):
    if quantity < 0:
        raise ValueError("quantity must be nonnegative")
    return unit_cents * quantity
