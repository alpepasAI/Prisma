![Data Consistency Paradigm](assets/covers/003-consistency-hero.png)

## **From Data Integrity to Cloud Speed**

# **Paradigm Shift: From Referential Integrity in DB to Delegated Consistency in the Backend**

Modern software architecture is undergoing a fundamental shift in how we manage the "truth" of our data. For decades, the standard was to blindly trust the Relational Database (RDBMS) as the ultimate guardian of integrity. However, in the era of microservices and hyper-massive scale, this centralized model has become a bottleneck. Today, consistency is being delegated to the Backend.

### **The Twilight of Relational Monoliths**

The traditional model is based on **ACID** properties (Atomicity, Consistency, Isolation, and Durability). Its star tool is *Foreign Keys*, which ensure that there are never "orphan" records. But this rigor comes at a price: table locks and latencies that prevent horizontal scaling.

To scale, many organizations have embraced the **BASE** model (Basically Available, Soft state, Eventual consistency). Here, availability takes precedence over immediate consistency. Data "converges" eventually, allowing the system to keep functioning even if some parts are out of sync.

### **Delegating Logic to the Backend**

By removing native database constraints, the responsibility for maintaining order falls on the application code. This is achieved through distributed design patterns:

1.  **Saga Pattern:** Manages transactions that span multiple services. If a step fails (e.g., payment), the Saga executes "compensatory transactions" to undo previous steps (e.g., releasing inventory).
2.  **Transactional Outbox:** Ensures that a database change and the notification to other services (via Kafka or RabbitMQ) occur atomically, preventing one from happening without the other.
3.  **CDC (Change Data Capture):** Directly listens to the database transaction log to propagate changes in real-time without overloading the business logic.

### **The Great Trade-off: Speed vs. Complexity**

Removing foreign keys is not a free decision. It is a calculated exchange:

*   **Gain:** Write performance can increase by 30% to 50%. Systems like DynamoDB or Cassandra can handle millions of events per second by not having to verify relationships on every insertion.
*   **Cost:** Complexity moves to the developer. Table joins (*JOINs*) no longer occur in the database engine but in the Backend memory, which can increase read latency and network traffic.

### **Risks and Conclusion**

Delegating consistency introduces the danger of **silent data corruption**. A backend bug can leave inconsistent data without the database throwing an error. This requires a higher level of technical maturity, with distributed tracing and constant reconciliation processes.

At PRISMA, we believe consistency is not an "all or nothing" proposition, but a resource that must be adjusted according to context. The future belongs to hybrid architectures that know when to be rigid to protect the "source of truth" and when to be flexible to allow for infinite growth.
