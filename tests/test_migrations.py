import importlib.util
from pathlib import Path
import sqlite3
import unittest

path = Path(__file__).parent / 'fixtures/migrations/migrate.py'
spec = importlib.util.spec_from_file_location('migration_fixture', path)
migration = importlib.util.module_from_spec(spec); spec.loader.exec_module(migration)

class Migrations(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.db.execute('CREATE TABLE users (id INTEGER PRIMARY KEY, display_name TEXT)')
        self.db.executemany('INSERT INTO users VALUES (?, ?)', [(1, ' Alice '), (2, 'BOB')])
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_old_and_new_app_during_expand_and_resumable_backfill(self):
        migration.expand(self.db); migration.expand(self.db)
        self.assertEqual(migration.read_new_app(self.db, 1), 'alice')
        self.assertEqual(migration.backfill_batch(self.db, 1), 1)
        self.db.execute('INSERT INTO users (id, display_name) VALUES (?, ?)', (3, ' Carol ')); self.db.commit()
        self.assertEqual(migration.read_new_app(self.db, 3), 'carol')
        with self.assertRaises(ValueError): migration.validate_contract_ready(self.db)
        self.assertEqual(migration.backfill_batch(self.db, 1), 1)
        self.assertEqual(migration.backfill_batch(self.db, 1), 1)
        self.assertEqual(migration.backfill_batch(self.db, 1), 0)
        migration.validate_contract_ready(self.db)
        self.assertEqual(self.db.execute('SELECT display_name FROM users WHERE id=1').fetchone()[0], ' Alice ')

    def test_invalid_rows_rollback_the_batch_and_block_contract(self):
        self.db.execute('UPDATE users SET display_name = ? WHERE id = 2', (' ',)); self.db.commit()
        migration.expand(self.db)
        with self.assertRaises(ValueError): migration.backfill_batch(self.db)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM users WHERE normalized_name IS NOT NULL').fetchone()[0], 0)
        with self.assertRaises(ValueError): migration.validate_contract_ready(self.db)
