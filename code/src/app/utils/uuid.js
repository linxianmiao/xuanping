// 生成随机的36位UUID
import { v4 as uuidv4 } from 'uuid'

const getUid = () => {
  const uuid = uuidv4()
  return uuid.replace(/-/g, '')
}

export default getUid
