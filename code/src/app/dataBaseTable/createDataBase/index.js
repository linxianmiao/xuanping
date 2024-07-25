import { Steps, Button, message, Divider, Tabs } from '@uyun/components'
import React, { useState, useRef, useEffect } from 'react'
import { inject, observer } from 'mobx-react'
import BasicInfo from './BasicInfo'
import FieldConfiguration from './FieldConfiguration'
import InitializedTable from '../initializedTable'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import ErrorBoundary from '~/components/ErrorBoundary'
import { linkToData } from '~/components/LowcodeLink'

const App = (props) => {
  const [current, setCurrent] = useState(0)

  const [activeKey, setActiveKey] = useState('maintenance')

  const [loading, setLoading] = useState(false)

  const [dataSetId, setDataSetId] = useState(props?.dataSetId)

  const basicInfoRef = useRef()

  const steps = [
    {
      title: '基本信息',
      key: 'basicInfo',
      content: <BasicInfo {...props} ref={basicInfoRef} dataSetId={dataSetId} />
    },
    {
      title: '字段配置',
      key: 'configuration',
      content: (
        <FieldConfiguration
          {...props}
          dataSetId={dataSetId}
          current={window.location.href.indexOf('edit') > -1 ? activeKey : current}
        />
      )
    },
    {
      title: props?.source === 'edit' ? '数据维护' : '数据初始化',
      key: 'maintenance',
      content: (
        <InitializedTable
          {...props}
          dataSetId={dataSetId}
          current={window.location.href.indexOf('edit') > -1 ? activeKey : current}
        />
      )
    }
  ]

  const onChange = (value) => {
    const { basicinfo } = props.dataBaseStore
    if (current === 0 && _.isEmpty(basicinfo)) return
    console.log('onChange:', value)
    setCurrent(value)
  }
  const next = () => {
    setCurrent(current + 1)
  }
  const prev = () => {
    setCurrent(current - 1)
  }

  const handlCancel = () => {
    let url = `/conf/database`
    if (window.LOWCODE_APP_KEY) {
      url = `/modellist/${window.LOWCODE_APP_KEY}/?activeTab=datatable`
    }
    linkToData({
      history: props.history,
      url: url,
      pageKey: 'database'
    })
  }

  const handleSubmit = () => {
    basicInfoRef.current.validateFieldsAndScroll(async (errors, values) => {
      if (errors) return false
      const { basicinfo, createDataSet, updateDataSet, setProps } = props.dataBaseStore
      setLoading(true)
      let res = !_.isEmpty(basicinfo)
        ? await updateDataSet({ ...values, dataSetId: basicinfo?.dataSetId })
        : await createDataSet(values)
      setLoading(false)
      console.log(res)
      if (!_.isEmpty(res)) {
        setDataSetId(res?.dataSetId)
        setProps({ basicinfo: res })
        message.success('保存成功')
        if (window.location.href.indexOf('edit') === -1) {
          setTimeout(() => {
            next()
          }, 100)
        }
      }
    })
  }

  const handleActiveKey = (value) => {
    setActiveKey(value)
  }
  const items = steps.map((item) => ({
    key: item.title,
    title: item.title
  }))

  useEffect(() => {
    window.LOWCODE_APP_KEY = props.match.params.appkey
    return () => {
      if (
        window.location.href.indexOf('create') === -1 &&
        window.location.href.indexOf('edit') === -1
      ) {
        props.dataBaseStore.setProps({ basicinfo: {} })
        window.LOWCODE_APP_KEY = ''
      }
    }
  })

  return (
    <div className="database-info" id="database">
      {window.LOWCODE_APP_KEY ? (
        <Button
          onClick={() => {
            handlCancel()
          }}
        >
          返回
        </Button>
      ) : (
        <PageHeader appkey={props.match.params.appkey} source="datatable" />
      )}
      <ContentLayout>
        <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
          {props?.source === 'edit' ? (
            <Tabs activeKey={activeKey} centered onChange={handleActiveKey}>
              {steps.map((tab) => {
                return (
                  <Tabs.TabPane tab={tab.title} key={tab.key}>
                    {tab.content}
                  </Tabs.TabPane>
                )
              })}
            </Tabs>
          ) : (
            <>
              <Steps type="navigation" current={current} onChange={onChange} items={items} />
              <Divider className="database-info-divider" />
              <div className="steps-content">{steps[current].content}</div>
            </>
          )}

          <div>
            {((current === 0 && props?.source !== 'edit') ||
              (props?.source === 'edit' && activeKey === 'basicInfo')) && (
              <div className="steps-action">
                <Button type="primary" onClick={handleSubmit} loading={loading}>
                  保存
                </Button>
                <Button onClick={() => handlCancel()}>取消</Button>
              </div>
            )}
            {current !== 0 && current < steps.length - 1 && (
              <div className="steps-action">
                <Button type="primary" onClick={() => next()}>
                  下一步
                </Button>
                <Button onClick={() => prev()}>上一步</Button>
              </div>
            )}
            {current === steps.length - 1 && (
              <div className="steps-action">
                <Button
                  type="primary"
                  onClick={() => {
                    handlCancel()
                  }}
                >
                  完成
                </Button>
                <Button onClick={() => prev()}>上一步</Button>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </ContentLayout>
    </div>
  )
}
export default inject('dataBaseStore')(observer(App))
