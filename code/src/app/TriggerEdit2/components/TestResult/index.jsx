import React, { useCallback, useState } from 'react'
import { Button } from '@uyun/components'
import styles from './index.module.less'

const TestResultItem = ({
  item
}) => {
  const { triggerName, resultMsg, resultType, content } = item
  
  const [visible, setVisible] = useState(false)

  const getColor = useCallback((type) => {
    switch (type) {
      case '0':
        return '#e0694d'
      case '1':
        return '#4fa624'
      case '-1':
      default:
        return '#c9a100'
    }
  }, [])

  return (
    <div className={styles.item}>
      <h4>
        {triggerName}：
        <span style={{ color: getColor(resultType) }}>
          {resultMsg}
        </span>
        {
          !!content && (
            <Button
              style={{ marginLeft: 10 }}
              type="primary"
              size="small"
              onClick={() => setVisible(!visible)}
            >
              结果详情
            </Button>
          )
        }
        {
          visible && (
            <div className={styles.content}>
              {content}
            </div>
          )
        }
      </h4>
    </div>
  )
}

const TestResult = ({
  data = []
}) => {
  return (
    <div className={styles.wrap}>
      <h3>测试结果</h3>
      {
        data.map((item, index) => <TestResultItem key={index + ''} item={item} />)
      }
    </div>
  )
}

export default TestResult
