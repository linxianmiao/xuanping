import React, { Component } from 'react'
import { Provider, observer } from 'mobx-react'
import { Spin, Form } from '@uyun/components'
import stores from './stores'
import BasicInfo from './basicInfo'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import EventContainer from './eventContainer'
import TimeContainer from './timeContainer'
import FormFooter from './formFooter'
import { initalTriggerType } from './config/config'
import './style/index.less'

@Form.create()
@observer
class WrappedIndex extends Component {
  componentDidMount() {
    const { getTriggerById, getActionListByType, getFieldParamList } = stores.triggerStore
    if (this.props.match.params.id) {
      getTriggerById(this.props.match.params.id).then(res => {
        getActionListByType(res.triggerType)
      })
    } else {
      getActionListByType(initalTriggerType)
    }
    getFieldParamList()
  }

  render() {
    const { loading } = stores.triggerStore
    const { form } = this.props
    const isEventType = form.getFieldValue('triggerType') === '1'
    return (
      <Provider {...stores}>
        <Spin spinning={loading}>
          <PageHeader />
          <ContentLayout>
            <Form className="trigger-config">
              <BasicInfo form={form} />
              {isEventType ? <EventContainer form={form} /> : <TimeContainer form={form} />}
              <FormFooter form={form} />
            </Form>
          </ContentLayout>
        </Spin>
      </Provider>
    )
  }
}

export default WrappedIndex
