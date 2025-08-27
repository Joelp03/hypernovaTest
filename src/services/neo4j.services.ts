import neo4j, { Driver, Session, Record, int } from "neo4j-driver";

export class Neo4jService {
  private driver: Driver;
  private static instance: Neo4jService;

  private constructor() {
    const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password123';

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  public static getInstance(): Neo4jService {
    if (!Neo4jService.instance) {
      Neo4jService.instance = new Neo4jService();
    }
    return Neo4jService.instance;
  }

  public async testConnection(): Promise<boolean> {
    const session = this.driver.session();
    try {
      await session.run('RETURN 1');
      console.log('✅ Neo4j conectado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error conectando a Neo4j:', error);
      return false;
    } finally {
      await session.close();
    }
  }

  public getSession(): Session {
    return this.driver.session();
  }

  public async runQuery(query: string, parameters: any = {}): Promise<Record[]> {
    const session = this.getSession();
    try {
      const result = await session.run(query, parameters );
    
      return result.records;
    } finally {
      await session.close();
    }
  }

  public async runTransaction(queries: Array<{ query: string; params?: any }>): Promise<void> {
    const session = this.getSession();
    const tx = session.beginTransaction();
    
    try {
      for (const { query, params = {} } of queries) {
        await tx.run(query, params);
      }
      await tx.commit();
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      await session.close();
    }
  }


  public async close(): Promise<void> {
    await this.driver.close();
  }
}

export const neo4jService = Neo4jService.getInstance();