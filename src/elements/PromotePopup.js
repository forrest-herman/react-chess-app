import React, { Component } from "react"

export default class PromotePopup extends Component {
    // handleClick = () => {
    //     this.props.togglePopup()
    // }
    render() {
        return (
            <div className='modal'>
                <div className='modal_content'>
                    <span className='close' onClick={this.props.togglePopup}>
                        &times;{" "}
                    </span>
                    <p>Promote your pawn:</p>
                    <button
                        onClick={() => {
                            this.props.setPromote("q")
                            this.props.togglePopup()
                        }}
                    >
                        Queen
                    </button>
                    <button
                        onClick={() => {
                            this.props.setPromote("r")
                            this.props.togglePopup()
                        }}
                    >
                        Rook
                    </button>
                    <button
                        onClick={() => {
                            this.props.setPromote("b")
                            this.props.togglePopup()
                        }}
                    >
                        Bishop
                    </button>
                    <button
                        onClick={() => {
                            this.props.setPromote("n")
                            this.props.togglePopup()
                        }}
                    >
                        Knight
                    </button>
                </div>
            </div>
        )
    }
}
