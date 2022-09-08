import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../util/db";
import { unstable_getServerSession } from "next-auth/next"
import { nextAuthOptions } from "../auth/[...nextauth]";
import { Method } from "../../../types/Method";
interface Response { }

const method: Method = "POST";

interface ExtendedNextApiRequest extends NextApiRequest {
    body: {
        readonly studySetId: string,
        readonly score: number,
        readonly description?: string
    }
}

export default async function handler(
    req: ExtendedNextApiRequest,
    res: NextApiResponse<Response>
) {
    try {
        const session = await unstable_getServerSession(req, res, nextAuthOptions)

        if (!session) throw new Error("Unauthenticated")

        switch (req.method) {
            case method: {
                const { studySetId, score, description } = req.body;

                let data;
                if (!description) {
                    data = {
                        studySet: {
                            connect: {
                                id: studySetId
                            }
                        },
                        score
                    }
                } else {
                    data = {
                        studySet: {
                            connect: {
                                id: studySetId
                            }
                        },
                        score,
                        description
                    }
                }

                const review = await db.review.create({
                    data
                })

                return res.status(200).json({ review });
            }
            default: {
                throw new Error(
                    `Route "${req.url}" accepts "${method}" method. Provided "${req.method}"`
                );
            }
        }
    } catch (e: any) {
        console.log(e.toString())
        return res.status(400).json({
            e: e.toString()
        });
    }
}