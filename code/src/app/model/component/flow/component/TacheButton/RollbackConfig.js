import React from 'react'
import { Select, Tooltip, Checkbox } from '@uyun/components'

const RollBackDesc = (
  <div style={{ width: '220px' }}>
    <div>{'逐级回退：当前节点只能回退到上一节点；'}</div>
    <div>{'自由回退：当前节点可回退到经过的任意节点；'}</div>
    <div>{'定点回退：当前节点可回退到当前选择的节点，不支持回退到同步的人工节点。'}</div>
  </div>
)

const inlineStyles = { width: '150px', display: 'inline-block', marginRight: 5 }

const RollbackConfig = ({ record, fixedRollbackTache, onChange }) => {
  const { rollbackWay, rollbackTache, rollbackTacheFree, rollbackProcess, rollbackResumeType } = record
  const rollbackTacheFreeValue = rollbackTacheFree ? _.map(rollbackTacheFree, d => (
    {
      key: d.rollbackTacheId,
      label: d.rollbackTacheName
    }
  )) : undefined
  return (
    <div>
      <div>
        <Select
          style={inlineStyles}
          value={rollbackWay}
          onChange={value => {
            if (value === 0) {
              onChange('rollbackResumeType', 0)
            }
            if (value !== 2) {
              onChange('rollbackTache', null)
            }
            onChange('rollbackWay', value)
          }}
        >
          <Select.Option value={0}>{'逐级回退'}</Select.Option>
          <Select.Option value={1}>{'自由回退'}</Select.Option>
          <Select.Option value={2}>{'定点回退'}</Select.Option>
        </Select>
        {rollbackWay === 2 && (
          <Select
            placeholder={'请选择节点'}
            style={inlineStyles}
            labelInValue
            value={
              rollbackTache
                ? { key: rollbackTache.rollbackTacheId, label: rollbackTache.rollbackTacheName }
                : undefined
            }
            onChange={({ key, label }) => {
              onChange('rollbackTache', { rollbackTacheId: key, rollbackTacheName: label })
            }}
          >
            {fixedRollbackTache.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.text}
              </Select.Option>
            ))}
          </Select>
        )}
        {rollbackWay === 1 && (
          <Select
            placeholder={'请选择节点'}
            style={inlineStyles}
            labelInValue
            mode="multiple"
            value={rollbackTacheFreeValue}
            onChange={(e) => {
              const formatValue = _.map(e, d => ({
                rollbackTacheId: d.key,
                rollbackTacheName: d.label
              }))
              onChange('rollbackTacheFree', formatValue)
            }}
          >
            {fixedRollbackTache.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.text}
              </Select.Option>
            ))}
          </Select>
        )}
        <Tooltip placement="bottom" title={RollBackDesc}>
          <i className="iconfont icon-jinggao" />
        </Tooltip>
      </div>
      <div>
        <Checkbox
          checked={rollbackProcess === 1}
          onChange={e => onChange('rollbackProcess', e.target.checked ? 1 : 0)}
        >
          {'优先回退到处理组，无处理组则回退到处理人'}
        </Checkbox>
        {(rollbackWay === 1 || rollbackWay === 2) && (
          <>
            <div>
              <Checkbox
                checked={rollbackResumeType === 1}
                onChange={e => onChange('rollbackResumeType', e.target.checked ? 1 : 0)}
              >
                {'回退后再提交将直达当前节点'}
              </Checkbox>
            </div>
            <div>
              <Checkbox
                checked={rollbackResumeType === 2}
                onChange={e => onChange('rollbackResumeType', e.target.checked ? 2 : 0)}
              >
                {'处理人选择回退再提交方式'}
              </Checkbox>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

RollbackConfig.defaultProps = {
  record: {},
  fixedRollbackTache: [],
  onChange: () => {}
}

export default RollbackConfig
