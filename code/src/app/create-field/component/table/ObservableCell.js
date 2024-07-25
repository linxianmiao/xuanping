import React, { Component } from 'react'
import { Select, Tooltip } from '@uyun/components'
import styles from './strategy.module.less'
const Option = Select.Option

/**
 * 监听列只能是下拉字段 且改下拉字段必须
 */
export default class ObservableCell extends Component {
  render() {
    const { value, onChange, columns } = this.props
    return (
      <React.Fragment>
        <Select
          showSearch
          value={value}
          onChange={onChange}
          style={{ width: 200 }}
          optionFilterProp="children"
          placeholder={i18n('globe.select', '请选择')}
          notFoundContent={i18n('globe.notFound', '无法找到')}
        >
          {
            _.chain(columns)
              .filter(item => item.type === 'listSel')
              .map(item => {
                const readOnly = item.readOnly === 1
                return (
                  <Option key={item.value} title={item.label} disabled={readOnly}>
                    <Tooltip title={readOnly ? i18n('readonly.cannot.be.observable', '只读属性，不能监听') : undefined}>
                      <div>{item.label}</div>
                    </Tooltip>
                  </Option>
                )
              })
              .value()
          }
        </Select>
        <span className={styles.observableCell}>{'* ' + i18n('table-strategy-tip4')}</span>
      </React.Fragment>
    )
  }
}