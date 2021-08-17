import React, { Component } from "react"

export default class PromotePopup extends Component {
    // handleClick = () => {
    //     this.props.togglePopup()
    // }

    state = {
        show: false,
    }

    promiseInfo = {}

    // knight = async () => {
    //     return new Promise((resolve, reject) => {
    //         this.promiseInfo = {
    //             resolve,
    //             reject,
    //         }
    //         this.setState({
    //             show: true,
    //         })
    //         this.props.setPromote("n")
    //         this.props.togglePopup()
    //     })
    // }

    show = async () => {
        return new Promise((resolve, reject) => {
            this.promiseInfo = {
                resolve,
                reject,
            }
            this.setState({
                show: true,
            })
        })
    }

    hide = () => {
        this.setState({
            show: false,
        })
    }

    render() {
        const { show } = this.state
        const { resolve, reject } = this.promiseInfo

        return show ? (
            <div className='modal'>
                <div className='modal_content'>
                    <span
                        className='close'
                        onClick={() => {
                            this.hide()
                            reject()
                        }}
                    >
                        &times;{" "}
                    </span>
                    <p>Promote your pawn:</p>
                    <button
                        onClick={() => {
                            this.hide()
                            resolve("q")
                        }}
                    >
                        Queen
                    </button>
                    <button
                        onClick={() => {
                            this.hide()
                            resolve("r")
                        }}
                    >
                        Rook
                    </button>
                    <button
                        onClick={() => {
                            this.hide()
                            resolve("b")
                        }}
                    >
                        Bishop
                    </button>
                    <button
                        onClick={() => {
                            this.hide()
                            resolve("n")
                        }}
                    >
                        Knight
                    </button>
                </div>
            </div>
        ) : null
    }

    getResolve() {
        const { resolve = () => {} } = this.promiseInfo || {}
        return (result) => {
            resolve(result)
            this.hide()
        }
    }

    /**
     * reject
     */
    getReject() {
        const { reject = () => {} } = this.promiseInfo || {}
        return (err) => {
            reject(err)
            this.hide()
        }
    }
}
