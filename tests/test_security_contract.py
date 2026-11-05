import importlib.util
from pathlib import Path
import sqlite3
import unittest

path = Path(__file__).parent / 'fixtures/security/orders.py'
spec = importlib.util.spec_from_file_location('security_fixture', path)
orders = importlib.util.module_from_spec(spec); spec.loader.exec_module(orders)

class SecurityContract(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.db.execute('CREATE TABLE orders (id INTEGER, owner_id INTEGER, amount INTEGER)')
        self.db.execute('INSERT INTO orders VALUES (1, 10, 125)')

    def tearDown(self): self.db.close()

    def assert_owner_boundary(self, lookup):
        self.assertEqual(lookup(self.db, 1, 10), (1, 10, 125))
        self.assertIsNone(lookup(self.db, 1, 11))

    def test_owner_check_and_parameterized_query(self):
        self.assert_owner_boundary(orders.order_for_user)
        self.assertIsNone(orders.order_for_user(self.db, '1 OR 1=1', 11))

    def test_missing_owner_predicate_is_detected(self):
        def mutant(connection, identity, user):
            return connection.execute('SELECT id, owner_id, amount FROM orders WHERE id = ?', (identity,)).fetchone()
        with self.assertRaises(AssertionError): self.assert_owner_boundary(mutant)
