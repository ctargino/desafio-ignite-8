import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    type,
    amount,
    description,
    sender_id,
  }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (sender_id) {
      const senderUser = await this.usersRepository.findById(sender_id);

      if (!senderUser) {
        throw new CreateStatementError.UserNotFound();
      }

      if (type === "transfer") {
        const { balance } = await this.statementsRepository.getUserBalance({
          user_id: sender_id,
        });

        if (balance < amount) {
          throw new CreateStatementError.InsufficientFunds();
        }
      }

      let statementOperation = await this.statementsRepository.create({
        user_id,
        sender_id,
        type,
        amount,
        description,
      });

      return statementOperation;
    }

    if (type === "withdraw") {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    }

    let statementOperation = await this.statementsRepository.create({
      user_id,
      sender_id,
      type,
      amount,
      description,
    });

    return statementOperation;
  }
}
