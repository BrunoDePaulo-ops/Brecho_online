import logging
from django.db import transaction
from .services.audit import registrar_evento

logger = logging.getLogger(__name__)


class AuditoriaMixin:
    audit_entity = None  # definido em cada viewset

    def _auditar(self, action, entity_id, data):
        usuario = self.request.user
        actor_id = usuario.pk if usuario.is_authenticated else "anonymous"

        try:
            registrar_evento(
                action=action,
                entity=self.audit_entity,
                entity_id=entity_id,
                actor_id=actor_id,
                data=data,
            )
        except Exception:
            logger.exception(
                "Falha ao registrar auditoria: %s, %s=%s",
                action,
                self.audit_entity,
                entity_id,
            )

    def _auditar_apos_commit(self, action, entity_id, data):
        transaction.on_commit(lambda: self._auditar(action, entity_id, data))