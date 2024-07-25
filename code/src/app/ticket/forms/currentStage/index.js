import React from 'react'
import FormItem from '../components/formItem'
import Step from '~/components/step'

class CurrentStage extends React.Component {
  render() {
    const { field, fieldMinCol, source, forms } = this.props
    const defaultStages = [
      { stageCode: 'start', stageId: '1', stageName: '阶段一', stageSort: 1 },
      { stageCode: 'middle', stageId: '2', stageName: '阶段二', stageSort: 2 },
      { stageCode: 'end', stageId: '3', stageName: '阶段三', stageSort: 3 }
    ]
    let stageList = forms?.modelStageVoList,
      activeStep = forms?.activityStageCode

    if (source === 'formset') {
      stageList = defaultStages
      activeStep = 'start'
    }
    return <Step stageList={stageList} activeStep={activeStep} />
  }
}

export default CurrentStage
