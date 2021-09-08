import { Request, Response } from "express";
import { container } from "tsyringe";

import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

export class GetStatementOperationController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { statement_id } = request.params;

    const getStatementOperation = container.resolve(
      GetStatementOperationUseCase
    );

    const statementOperation = await getStatementOperation.execute({
      user_id,
      statement_id,
    });

    if (!statementOperation.sender_id) {
      const { sender_id, ...statement } = statementOperation;
      return response.json(statement);
    }

    return response.json(statementOperation);
  }
}
