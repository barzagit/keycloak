import pymysql
from contextlib import contextmanager


class Database:
    """Wrapper per il database MySQL usando PyMySQL

    Supporta la connessione SSL opzionale tramite parametro `ssl_mode`.
    L'AMBIENTE può fornire anche `DB_SSL_MODE` (es. "REQUIRED").
    """

    def __init__(self, host: str, user: str, password: str, database: str, port: int = 3306, ssl_mode: str | None = None):
        self.config = {
            'host': host,
            'user': user,
            'password': password,
            'database': database,
            'port': port,
            'charset': 'utf8mb4',
            'cursorclass': pymysql.cursors.DictCursor,  # Risultati come dict
        }
        # se è richiesto SSL, PyMySQL si aspetta un dizionario "ssl" con la
        # configurazione. Aiven accetta almeno ssl-mode=REQUIRED.
        if ssl_mode:
            # alcuni provider usano "ssl-mode" come chiave
            self.config['ssl'] = {'ssl-mode': ssl_mode}

    @contextmanager
    def get_connection(self):
        """Context manager per ottenere una connessione"""
        connection = pymysql.connect(**self.config)
        try:
            yield connection
        finally:
            connection.close()

    def create_tables(self):
        """Crea le tabelle se non esistono"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                # Tabella dei voti
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS voti (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username_studente VARCHAR(255) NOT NULL,
                        nome_studente VARCHAR(255) NOT NULL,
                        materia VARCHAR(255) NOT NULL,
                        voto INT NOT NULL CHECK (voto >= 0 AND voto <= 10),
                        data_inserimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        username_docente VARCHAR(255) NOT NULL,
                        UNIQUE KEY unique_voto (username_studente, materia, data_inserimento)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """)
                conn.commit()

    def insert_voto(self, username_studente: str, nome_studente: str, materia: str, 
                    voto: int, username_docente: str) -> dict:
        """Inserisce un voto"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO voti (username_studente, nome_studente, materia, voto, username_docente)
                    VALUES (%s, %s, %s, %s, %s)
                """, (username_studente, nome_studente, materia, voto, username_docente))
                conn.commit()
                return {
                    'id': cursor.lastrowid,
                    'username_studente': username_studente,
                    'nome_studente': nome_studente,
                    'materia': materia,
                    'voto': voto,
                    'username_docente': username_docente
                }

    def get_all_voti(self) -> list:
        """Ottiene tutti i voti"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, username_studente, nome_studente, materia, voto, 
                           data_inserimento, username_docente
                    FROM voti
                    ORDER BY data_inserimento DESC
                """)
                return cursor.fetchall()

    def get_voti_studente(self, username_studente: str) -> list:
        """Ottiene i voti di uno specifico studente"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, username_studente, nome_studente, materia, voto, 
                           data_inserimento, username_docente
                    FROM voti
                    WHERE username_studente = %s
                    ORDER BY data_inserimento DESC
                """, (username_studente,))
                return cursor.fetchall()

    def get_voti_by_materia(self, materia: str) -> list:
        """Ottiene tutti i voti di una materia"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, username_studente, nome_studente, materia, voto, 
                           data_inserimento, username_docente
                    FROM voti
                    WHERE materia = %s
                    ORDER BY nome_studente, data_inserimento DESC
                """, (materia,))
                return cursor.fetchall()

    def delete_voto(self, voto_id: int) -> bool:
        """Elimina un voto"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM voti WHERE id = %s", (voto_id,))
                conn.commit()
                return cursor.rowcount > 0
