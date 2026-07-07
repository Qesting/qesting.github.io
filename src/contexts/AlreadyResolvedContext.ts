import { createContext } from "react";
import { RPCItem } from "../helpers/types";

export type AlreadyResolvedType = {[key: string]: { [key: string]: { [key: string]: RPCItem}}}

const AlreadyResolvedContext = createContext<AlreadyResolvedType>({})

export default AlreadyResolvedContext