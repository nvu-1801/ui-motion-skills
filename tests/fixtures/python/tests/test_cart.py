import unittest
from cart import total_cents

class CartContract(unittest.TestCase):
    def test_three_items(self):
        self.assertEqual(total_cents(125, 3), 375)

    def test_empty_cart(self):
        self.assertEqual(total_cents(125, 0), 0)

    def test_negative_quantity_is_rejected(self):
        with self.assertRaises(ValueError):
            total_cents(125, -1)
