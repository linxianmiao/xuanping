import React, { useState, useRef } from 'react'
import { PlusOutlined } from '@uyun/icons'
import { Modal, Form as UForm } from '@uyun/components'
import uuid from '~/utils/uuid'
import ListenRuleForm from './Form'
import styles from '../OverdueStrategy/index.module.less'

const FormItem = UForm.Item

const validator = (monitors, value) => {
  return (
    monitors &&
    monitors.some((monitor) => {
      if (!monitor.useTimingMonitor) {
        return false
      }
      return !value || value.findIndex((item) => item.olaId === monitor.id) < 0
    })
  )
}

const ListenRule = ({ value = [], onChange = () => {}, modelId }) => {
  const [visible, setVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  // 当前正在编辑的index
  const [currentIndex, setCurrentIndex] = useState(0)
  const [data, setData] = useState({})
  const [isNameError, setNameError] = useState(false)
  const [isIncidentError, setIncidentError] = useState(false)

  const handleOk = () => {
    if (!data.name) {
      setNameError(true)
    } else {
      setNameError(false)
    }
    if (_.isEmpty(data.incident)) {
      setIncidentError(true)
    } else {
      setIncidentError(false)
    }
    const nextValue = [...value]
    nextValue[currentIndex] = data
    onChange(nextValue)
    setVisible(false)
  }

  const handleDelete = (index, e) => {
    e.stopPropagation()

    const nextValue = [...value]
    nextValue.splice(index, 1)
    onChange(nextValue)
  }

  const setTriggerData = (value, key) => {
    const newData = _.cloneDeep(data)
    if (key === 'double') {
      newData.incident = value.typeValue
      newData.taskEndIncident = value.classValue
    } else if (key === 'params') {
      newData.params = [
        {
          id: uuid(),
          name: '调用脚本',
          type: 'script',
          executeParamPos: [
            {
              name: '脚本内容',
              code: 'scriptContent',
              type: 5,
              value: value
            }
          ]
        }
      ]
    } else {
      newData[key] = value
    }
    setData(newData)
  }

  return (
    <div>
      {value.map((item, index) => (
        <div
          key={item.id}
          className={styles.editListenBtn}
          onClick={() => {
            setModalTitle(item.name)
            setCurrentIndex(index)
            setData(item)
            setVisible(true)
          }}
        >
          {item.name}
          <i className="iconfont icon-cha" onClick={(e) => handleDelete(index, e)} />
        </div>
      ))}

      <FormItem>
        <div
          className={styles.addBtn}
          onClick={() => {
            setModalTitle('添加监听策略')
            setCurrentIndex(value.length)
            const data = {
              id: uuid(),
              name: '',
              incident: ['start'],
              triggerConditions: {
                when: 'all',
                conditionExpressions: [],
                nestingConditions: []
              },
              params: []
            }
            setData(data)
            setVisible(true)
          }}
        >
          <PlusOutlined />
          &nbsp;{i18n('add_noti_rules', '添加策略')}
        </div>
      </FormItem>

      <Modal
        title={modalTitle}
        width={720}
        visible={visible}
        destroyOnClose
        onCancel={() => setVisible(false)}
        onOk={handleOk}
      >
        <ListenRuleForm
          triggerData={data}
          currentIndex={currentIndex}
          setTriggerData={setTriggerData}
          modelId={modelId}
          isNameError={isNameError}
          isIncidentError={isIncidentError}
          setNameError={setNameError}
          setIncidentError={setIncidentError}
        />
      </Modal>
    </div>
  )
}

export default ListenRule
