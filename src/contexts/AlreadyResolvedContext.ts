import { createContext, Context } from "react";
import { RPCItem } from "../helpers/types";

export type AlreadyResolvedType = {[key: string]: { [key: string]: { [key: string]: RPCItem}}}

const AlreadyResolvedContext: Context<AlreadyResolvedType> = createContext<AlreadyResolvedType>({})

export default AlreadyResolvedContext