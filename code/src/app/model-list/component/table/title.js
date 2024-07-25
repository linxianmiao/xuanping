import React, { Component } from 'react'
import classnames from 'classnames'
import LowcodeLink, { linkTo } from '~/components/LowcodeLink'
import { withRouter } from 'react-router-dom'

@withRouter
class Title extends Component {
  render() {
    const { mode, id, childModel, name } = this.props

    let href = mode === 0 ? `/conf/model/edit/${id}` : `/conf/model/advanced/${id}`

    return (
      <a
        className="model-title"
        onClick={() => {
          linkTo({
            url: href,
            history: this.props.history,
            modelId: id,
            pageKey: 'model_edit'
          })
        }}
        // pageKey="model_edit"
        // modelId={id}
      >
        <i
          className={classnames('iconfont', {
            'icon-liebiaomoshi1': mode === 0,
            'icon-apartment': mode === 1 && childModel === 1,
            'icon-feiziliucheng': mode === 1 && childModel === 0
          })}
        />
        <span>{name}</span>
      </a>
    )
  }
}

// function Title(props) {
//   // mode  === 0 一般的模型       mode === 1 高级模型
//   // childModel  1 子流程 ， 0非子流程，仅在高级流程生效
//   const { mode, id, childModel, name } = props
//   const href = mode === 0 ? `/conf/model/edit/${id}` : `/conf/model/advanced/${id}`

//   return (
//     <LowcodeLink className="model-title" url={href} pageKey="model_edit" modelId={id}>
//       <i
//         className={classnames('iconfont', {
//           'icon-liebiaomoshi1': mode === 0,
//           'icon-apartment': mode === 1 && childModel === 1,
//           'icon-feiziliucheng': mode === 1 && childModel === 0
//         })}
//       />
//       <span>{name}</span>
//     </LowcodeLink>
//   )
// }

export default Title
