// import { Steps } from '@uyun/components'
import React, { useState, useEffect } from 'react'
import Steps from './Step'

const Step = ({ stageList, activeStep }) => {
  const [sortStageList, setStageList] = useState([])
  useEffect(() => {
    const activeSort = activeStep
      ? _.find(stageList, (d) => d.stageCode === activeStep).stageSort
      : 0
    const list = _.map(stageList, (d) => ({
      status: d.stageSort === activeSort ? 'process' : d.stageSort > activeSort ? 'wait' : 'finish',
      title: d.stageName
    }))
    setStageList(list)
  }, [stageList, activeStep])

  const isAllWait = _.every(sortStageList, (d) => d.status === 'wait')
  const className = isAllWait ? 'disabledStep' : ''
  return <Steps className={className} items={sortStageList} />
}
export default Step
