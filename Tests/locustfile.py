from locust import HttpUser, task, between
import random

class Cliente(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        r = self.client.get("/api/products/", name="/api/products/ (setup)")
        data = r.json() if r.ok else []
        items = data["results"] if isinstance(data, dict) and "results" in data else data
        self.ids = [p["id"] for p in items]

    @task(5)
    def listar(self):
        self.client.get("/api/products/", name="/api/products/")

    @task(2)
    def detalhe(self):
        if not self.ids:
            return
        self.client.get(f"/api/products/{random.choice(self.ids)}/", name="/api/products/[id]")