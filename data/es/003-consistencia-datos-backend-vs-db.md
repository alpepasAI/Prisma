![Paradigma de Consistencia de Datos](assets/covers/003-consistency-hero.png)

# **Cambio de Paradigma: De la Integridad Referencial en DB a la Consistencia Delegada en el Backend**

La arquitectura de software moderna está viviendo un cambio fundamental en la forma en que gestionamos la verdad de nuestros datos. Durante décadas, el estándar fue confiar ciegamente en la base de datos relacional (RDBMS) como el guardián último de la integridad. Sin embargo, en la era de los microservicios y la escala hipermasiva, este modelo centralizado se ha convertido en un cuello de botella. Hoy, la consistencia se está delegando al Backend.

### **El Ocaso del Monolitismo Relacional**

El modelo tradicional se basa en las propiedades **ACID** (Atomicidad, Consistencia, Aislamiento y Durabilidad). Su herramienta estrella son las *Foreign Keys* o claves ajenas, que aseguran que nunca haya datos "huérfanos". Pero este rigor tiene un precio: bloqueos de tablas y latencias que impiden el escalado horizontal.

Para escalar, muchas organizaciones han abrazado el modelo **BASE** (Basically Available, Soft state, Eventual consistency). Aquí, la disponibilidad prima sobre la consistencia inmediata. Los datos "convergen" eventualmente, permitiendo que el sistema siga funcionando incluso si algunas partes están desincronizadas.

### **Delegando la Lógica al Backend**

Al eliminar las restricciones nativas de la base de datos, la responsabilidad de mantener el orden recae en el código de la aplicación. Esto se logra mediante patrones de diseño distribuidos:

1.  **Patrón Saga:** Gestiona transacciones que abarcan múltiples servicios. Si un paso falla (por ejemplo, el pago), la Saga ejecuta "transacciones compensatorias" para revertir los pasos anteriores (liberar el inventario).
2.  **Transactional Outbox:** Garantiza que un cambio en la base de datos y la notificación a otros servicios (vía Kafka o RabbitMQ) ocurran de forma atómica, evitando que uno suceda sin el otro.
3.  **CDC (Change Data Capture):** Escucha directamente el log de transacciones de la base de datos para propagar cambios en tiempo real sin sobrecargar la lógica de negocio.

### **El Gran Trade-off: Velocidad vs. Complejidad**

Eliminar las claves ajenas no es una decisión gratuita. Es un intercambio calculado:

*   **Ganancia:** El rendimiento de escritura puede aumentar entre un 30% y un 50%. Sistemas como DynamoDB o Cassandra pueden manejar millones de eventos por segundo al no tener que verificar relaciones en cada inserción.
*   **Coste:** La complejidad se traslada al desarrollador. Las uniones de tablas (*JOINs*) ya no ocurren en el motor de la base de datos, sino en la memoria del Backend, lo que puede aumentar la latencia de lectura y el tráfico de red.

### **Riesgos y Conclusión**

Delegar la consistencia introduce el peligro de la **corrupción silenciosa**. Un bug en el backend puede dejar datos inconsistentes sin que la base de datos emita un error. Esto exige un nivel de madurez técnica superior, con trazabilidad distribuida y procesos de reconciliación constantes.

En PRISMA creemos que la consistencia no es un "todo o nada", sino un recurso que debe ajustarse según el contexto. El futuro pertenece a las arquitecturas híbridas que saben cuándo ser rígidas para proteger la "fuente de la verdad" y cuándo ser flexibles para permitir el crecimiento infinito.
