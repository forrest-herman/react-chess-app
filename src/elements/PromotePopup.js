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
                    <button onClick={() => console.log("Promote to rook")}>Rook</button>
                    <button onClick={() => console.log("Promote to bishop")}>Bishop</button>
                    <button onClick={() => this.props.setPromote("n")}>Knight</button>
                </div>
            </div>
        )
    }
}
