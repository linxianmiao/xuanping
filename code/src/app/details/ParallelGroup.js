/**
 * 并行用户组组件
 *
 * @param {number} tacheType        流程状态： 0: 普通环节; 1: 并行组; 2:并行环节
 * @param {string} title            流程名称
 * @param {array}  parallelismNode  并行流程数据
 *
 * @author 顾少华<gush@uyunsoft.cn>
 */

import React, { Component } from 'react'
import { Popover, Steps } from '@uyun/components'
import ExucuterList from './ExucuterList'
import { getClassAndState, counterSingArray } from './util.js'
import './style/parallelGroup.less'
const Step = Steps.Step

const ParallelStep = props => {
  const data = props.data
  return (
    <div className="parallel-step-box">
      <Steps direction="vertical" size="small" current={1}>
        {_.map(data, (item, i) => {
          const { name, status, counterSign, exector, current } = item
          // 状态对应类名及名称
          const { statusClass, statusName } = getClassAndState(status)

          // 流程标题
          const title = name + (counterSign ? `(${counterSingArray[counterSign]})` : '')
          const description = (
            <div>
              <p>{statusName}</p>
              <ExucuterList users={exector} />
            </div>
          )
          return (
            <Step key={i}
              status={statusClass}
              title={title}
              className={current === 1 ? 'active' : ''}
              description={description}
            />
          )
        })}
      </Steps>
    </div>
  )
}

class ParallelGroup extends Component {
  render () {
    const { tacheType, parallelismNode, title } = this.props
    return (
      <div>
        { tacheType === 1
          ? <Popover
            overlayClassName="parallel-step-pop"
            placement="right"
            content={<ParallelStep data={parallelismNode} />}
          >
            <p>
              {title}
            </p>
          </Popover>
          : <span>
            {
              tacheType === 3
                ? <i className="iconfont icon-zidongchulijieduan" style={{ fontSize: '12px' }} />
                : null
            }
            {title}
          </span>
        }
      </div>
    )
  }
}

export default ParallelGroup
