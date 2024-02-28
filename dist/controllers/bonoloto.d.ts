import { Request, Response } from "express";
import { BonolotoResult } from "./type";
export declare function getLoteriasData(startDate: string, endDate: string): Promise<BonolotoResult[] | undefined>;
export declare function getBonolotoResults(req: Request, res: Response): Promise<void>;
export declare function getLastBonolotoResults(req: Request, res: Response): Promise<void>;
