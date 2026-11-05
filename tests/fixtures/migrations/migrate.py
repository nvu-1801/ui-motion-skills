"""Tiny SQLite expand/backfill example; not a production online-DDL claim."""
def expand(connection):
    columns = {row[1] for row in connection.execute('PRAGMA table_info(users)')}
    if 'normalized_name' not in columns:
        connection.execute('ALTER TABLE users ADD COLUMN normalized_name TEXT')
    connection.commit()


def backfill_batch(connection, size=2):
    if type(size) is not int or size < 1:
        raise ValueError('batch size must be positive')
    rows = connection.execute('SELECT id, display_name FROM users WHERE normalized_name IS NULL ORDER BY id LIMIT ?', (size,)).fetchall()
    with connection:
        for identity, name in rows:
            if not name or not name.strip():
                raise ValueError('invalid existing name')
            connection.execute('UPDATE users SET normalized_name = ? WHERE id = ? AND normalized_name IS NULL', (name.strip().lower(), identity))
    return len(rows)


def read_new_app(connection, identity):
    return connection.execute('SELECT COALESCE(normalized_name, lower(trim(display_name))) FROM users WHERE id = ?', (identity,)).fetchone()[0]


def validate_contract_ready(connection):
    invalid = connection.execute("SELECT COUNT(*) FROM users WHERE normalized_name IS NULL OR trim(normalized_name) = ''").fetchone()[0]
    if invalid:
        raise ValueError('backfill incomplete or invalid; cannot tighten contract')
