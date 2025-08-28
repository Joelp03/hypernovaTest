import { DataLoader } from "./load-data"

let dataLoader =  new DataLoader()

const loadData = async () => {
  await dataLoader.loadData()
  console.log("Data loaded successfully")
  process.exit(0)
}

loadData()