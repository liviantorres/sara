from sqlalchemy import inspect
from app.infrastructure.db.session import engine

def bisbilhotar_banco():
    # Cria o inspetor usando a sua conexão atual
    inspector = inspect(engine)
    
    tabelas = inspector.get_table_names()
    
    if not tabelas:
        print("O banco está completamente vazio! Nenhuma tabela encontrada.")
        return

    print("=== ESTRUTURA DO BANCO DE DADOS 'SARA' ===\n")
    
    for tabela in tabelas:
        print(f"Tabela: {tabela}")
        colunas = inspector.get_columns(tabela)
        for coluna in colunas:
            nome = coluna['name']
            tipo = coluna['type']
            obrigatorio = "NÃO NULO" if not coluna.get('nullable') else "Opcional"
            
            print(f"  -> {nome} | Tipo: {tipo} | {obrigatorio}")
        print("-" * 40)

if __name__ == "__main__":
    bisbilhotar_banco()