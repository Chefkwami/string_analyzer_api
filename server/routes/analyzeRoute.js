import express from "express"
import { analyzzeString, deleteString, getAllStrings, specificString } from "../controllers/strController.js"
import { filterByNaturalLanguage } from "../controllers/filter.js"



const router = express.Router()



router.post("/", analyzzeString)
router.get("/", getAllStrings)
router.get("/filter-by-natural-language", filterByNaturalLanguage);
router.get("/:string_value", specificString)
router.delete("/:string_value", deleteString)



export default router;