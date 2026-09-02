from fastapi import FastAPI


app = FastAPI(
    title="SARA",
    description="Sistema de Apoio ao Acompanhamento da Retenção Acadêmica",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "SARA API funcionando!"
    }