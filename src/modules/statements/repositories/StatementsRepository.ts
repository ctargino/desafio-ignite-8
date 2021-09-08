import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    sender_id,
    amount,
    description,
    type,
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      sender_id,
      amount,
      description,
      type,
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id },
    });
  }

  async getUserBalance({
    user_id,
    with_statement = false,
  }: IGetBalanceDTO): Promise<
    { balance: number } | { balance: number; statement: Statement[] }
  > {
    const statement = await this.repository.find({
      where: { user_id },
    });

    let balance = 0;

    const balanceStatement = statement.reduce((acc, operation) => {
      if (operation.type === "deposit" || operation.type === "transfer") {
        return acc + Number(operation.amount);
      } else {
        return acc - Number(operation.amount);
      }
    }, 0);

    balance = balanceStatement;

    const transferStatement = await this.repository.find({
      where: { sender_id: user_id },
    });

    if (transferStatement) {
      const balanceTransfer = transferStatement.reduce((acc, operation) => {
        if (operation.type === "transfer" && operation.sender_id === user_id) {
          return acc - Number(operation.amount);
        } else {
          return Number(operation.amount);
        }
      }, 0);

      balance = balanceStatement + balanceTransfer;
    }

    if (with_statement) {
      return {
        statement: [...statement, ...transferStatement],
        balance,
      };
    }

    return { balance };
  }
}
