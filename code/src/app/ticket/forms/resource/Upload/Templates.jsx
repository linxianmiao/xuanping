import React, { useState, useEffect } from 'react'
import { Button, Checkbox, Row, Col, Spin } from '@uyun/components'
import { getAssetCategoryLeaves } from './logic'

import styles from './index.module.less'

const Templates = props => {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [checked, setChecked] = useState([])

  // 获取资产类型
  const queryCategories = async () => {
    setLoading(true)

    let data = await axios.get('/asset/api/v1/equip/type/list')
    data = Array.isArray(data) ? _.filter(data, d => d.id) : []
    setCategories(getAssetCategoryLeaves(data))
    setLoading(false)
  }

  const handleDownload = () => {
    const params = {}

    checked.forEach(item => {
      const [code, name] = item.split('-')
      params[code] = name
    })

    const url = `/asset/api/v1/export/templates?param=${JSON.stringify(params)}`

    window.open(url)
  }

  useEffect(() => {
    queryCategories()
  }, [])

  return (
    <div className={styles.templatesWrap}>
      <div className={styles.header}>
        <span>{i18n('asset-tmp-download-tip-2', '请按资产类型进行下载Excel模板:')}</span>
        <Button
          type="primary"
          size="small"
          disabled={checked.length === 0}
          onClick={() => handleDownload()}
        >
          {i18n('download', '下载')}
        </Button>
      </div>
      <Spin spinning={loading}>
        <Checkbox.Group value={checked} onChange={setChecked}>
          <Row>
            {
              categories.map(({ code, name }) => (
                <Col key={code} span={6}>
                  <Checkbox value={`${code}-${name}`}>{name}</Checkbox>
                </Col>
              ))
            }
          </Row>
        </Checkbox.Group>
      </Spin>
    </div>
  )
}

Templates.defaultProps = {
  source: ''
}

export default Templates
