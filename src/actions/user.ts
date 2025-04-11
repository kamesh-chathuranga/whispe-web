"use server";

import { IUser, User } from "../model/UserModel";

export const getCurrentUserByEmail = async (email: string): Promise<IUser> => {
  try {
    const user = User.findOne({ email }).select("+password");

    return user;
  } catch (error) {
    throw error;
  }
};
