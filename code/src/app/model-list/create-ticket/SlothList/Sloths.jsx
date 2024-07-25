import React from 'react'
import { Spin, Input } from '@uyun/components'
import Card from './Card'
import styles from './index.module.less'

const InputSearch = Input.Search

const Sloths = (props) => {
  const {
    showFollow,
    data,
    loading,
    mode,
    selectList,
    onClick,
    onCollect,
    onChange,
    onSearch,
    value
  } = props

  return (
    <>
      <InputSearch
        placeholder={i18n('globe.keywords')}
        className={styles.searchCat}
        onSearch={(val) => onSearch(val)}
        value={value}
        onChange={onChange}
        allowClear
        onClear={() => {
          onSearch('')
        }}
      />
      <Spin wrapperClassName={styles.slothsSpin} spinning={loading}>
        <div className={styles.slothsWrapper}>
          {data.map((item) => {
            return (
              <Card
                key={item.id}
                showFollow={showFollow}
                data={item}
                mode={mode}
                selectList={selectList}
                onClick={onClick}
                onCollect={onCollect}
              />
            )
          })}
        </div>
      </Spin>
    </>
  )
}

Sloths.defaultProps = {
  data: [],
  mode: 'link',
  selectList: [],
  loading: false,
  categoryKey: undefined,
  showFollow: true,
  onFiltersChange: () => {},
  onClick: () => {},
  onCollect: () => {}
}

export default Sloths
