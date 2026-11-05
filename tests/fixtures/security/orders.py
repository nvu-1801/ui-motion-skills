def order_for_user(connection, order_id, user_id):
    return connection.execute('SELECT id, owner_id, amount FROM orders WHERE id = ? AND owner_id = ?', (order_id, user_id)).fetchone()
