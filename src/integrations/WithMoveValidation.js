import React, { Component, useState, useRef } from "react"
import PropTypes from "prop-types"
import Chess from "chess.js"
import "../App.css"

import PromotePopup from "../elements/PromotePopup"

import Chessboard from "chessboardjsx"

class HumanVsHuman extends Component {
    static propTypes = { children: PropTypes.func }

    state = {
        fen: "start",

        // square styles for active drop square
        dropSquareStyle: {},

        // custom square styles
        squareStyles: {},

        // square with the currently clicked piece
        pieceSquare: "",

        // currently clicked square
        square: "",

        // array of past game moves
        history: [],

        // current status of the game
        gameStatus: "New Game: White's Move",
    }

    componentDidMount() {
        this.game = new Chess()
    }

    updateBoard() {
        this.setState({
            fen: this.game.fen(),
            history: this.game.history({ verbose: true }),
            pieceSquare: "",
            // squareStyles: squareStyling({ pieceSquare: square, state.history }),
            gameStatus: this.gameOverType(),
        })
    }

    setFen(fen) {
        const loadSuccess = this.game.load(fen)
        this.updateBoard()
        return loadSuccess
    }

    // keep clicked square style and remove hint squares
    removeHighlightSquare = () => {
        this.setState(({ pieceSquare, history }) => ({
            squareStyles: squareStyling({ pieceSquare, history }),
        }))
    }

    // show possible moves
    highlightSquare = (sourceSquare, squaresToHighlight) => {
        const highlightStyles = [sourceSquare, ...squaresToHighlight].reduce((a, c) => {
            return {
                ...a,
                ...{
                    [c]: {
                        background: "radial-gradient(circle, #fffc62 36%, transparent 40%)",
                        borderRadius: "50%",
                    },
                },
                ...squareStyling({
                    history: this.state.history,
                    pieceSquare: this.state.pieceSquare,
                }),
            }
        }, {})

        this.setState(({ squareStyles }) => ({
            squareStyles: { ...squareStyles, ...highlightStyles },
        }))
    }

    onDrop = ({ sourceSquare, targetSquare }) => {
        // see if the move is legal
        let move = this.game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // always promote to a queen for example simplicity
        })

        // illegal move
        if (move === null) return

        this.setState(({ history, pieceSquare }) => ({
            fen: this.game.fen(),
            history: this.game.history({ verbose: true }),
            squareStyles: squareStyling({ pieceSquare, history }),
            gameStatus: this.gameOverType(),
        }))
    }

    // onMouseOverSquare = (square) => {
    //     // get list of possible moves for this square
    //     let moves = this.game.moves({
    //         square: square,
    //         verbose: true,
    //     })
    //     // console.log(this.game.moves);

    //     // exit if there are no moves available for this square
    //     if (moves.length === 0) return

    //     let squaresToHighlight = []
    //     for (var i = 0; i < moves.length; i++) {
    //         squaresToHighlight.push(moves[i].to)
    //     }

    //     this.highlightSquare(square, squaresToHighlight)
    // }

    highlightPossibleMoves = (square) => {
        // get list of possible moves for this square
        let moves = this.game.moves({
            square: square,
            verbose: true,
        })

        // exit if there are no moves available for this square
        if (moves.length === 0) return

        let squaresToHighlight = []
        for (var i = 0; i < moves.length; i++) {
            squaresToHighlight.push(moves[i].to)
        }

        this.highlightSquare(square, squaresToHighlight)
    }

    highlightMoves = (square) => {
        // get list of possible moves for this square
        let moves = this.game.moves({
            square: square,
            verbose: true,
        })
        // console.log(this.game.moves);

        // exit if there are no moves available for this square
        if (moves.length === 0) return

        let squaresToHighlight = []
        for (var i = 0; i < moves.length; i++) {
            squaresToHighlight.push(moves[i].to)
        }

        this.highlightSquare(square, squaresToHighlight)
    }

    // onMouseOutSquare = (square) => this.removeHighlightSquare(square)

    // central squares get diff dropSquareStyles
    onDragOverSquare = (square) => {
        this.setState({
            dropSquareStyle: square === "e4" || square === "d4" || square === "e5" || square === "d5" ? { backgroundColor: "cornFlowerBlue" } : { boxShadow: "inset 0 0 1px 4px rgb(255, 255, 0)" },
        })
    }

    onSquareClick = (square) => {
        this.setState(({ history }) => ({
            squareStyles: squareStyling({ pieceSquare: move !== null ? square : "", history }),
            pieceSquare: square,
        }))

        this.highlightMoves(square)

        // promotion logic
        if (this.isPromoting(this.state.pieceSquare, square)) {
            console.log("promote")
            this.props.togglePromote()
            console.log(this.props.promoteType)
        }

        let move = this.game.move({
            from: this.state.pieceSquare,
            to: square,
            promotion: this.props.promoteType, //isPromote(this.state.pieceSquare, square), //this.props.testPopup(), // always promote to a queen for example simplicity
        })

        // illegal move
        if (move === null) return

        // this.game.move.promotion = promotionType

        this.setState({
            fen: this.game.fen(),
            history: this.game.history({ verbose: true }),
            pieceSquare: "",
            gameStatus: this.gameOverType(),
            // squareStyles: squareStyling({ pieceSquare: square, state.history }),
        })
    }

    isPromoting(from, to) {
        const chess = this.game
        const piece = chess.get(from)

        // let move = chess.move({
        //     from: from,
        //     to: to,
        //     promotion: "q",
        // })
        // // illegal move
        // if (move === null) return false

        if (piece?.type !== "p") {
            // console.log("not pawn")
            return false
        }
        if (piece.color !== chess.turn()) {
            // console.log("wrong color")
            return false
        }
        if (!["1", "8"].some((it) => to.endsWith(it))) {
            // console.log("wrong position")
            return false
        }
        return true
        // return chess
        //   .moves({ square: move.from, verbose: true })
        //   .map((it) => it.to)
        //   .includes(move.to);
    }

    onSquareRightClick = (square) => {
        this.setState({
            squareStyles: { [square]: { backgroundColor: "deepPink" } },
        })
        //test
        this.game.load("4k3/4P3/4Q3/8/8/8/3K4/8 w - - 0 78")
        this.setState({
            fen: this.game.fen(),
            history: this.game.history({ verbose: true }),
            pieceSquare: "",
            // squareStyles: squareStyling({ pieceSquare: square, state.history }),
            gameStatus: this.gameOverType(),
        })
    }

    undoMove = () => {
        this.game.undo()
        this.setState({
            fen: this.game.fen(),
            history: this.game.history({ verbose: true }),
            pieceSquare: "",
            // squareStyles: squareStyling({ pieceSquare: square, state.history }),
            gameStatus: this.gameOverType(),
        })
    }

    // useImperativeHandle(this.props.ref, () => ({
    //     getAlert() {
    //         alert("getAlert from Child")
    //     }
    // }))

    gameOverType = () => {
        let gameState
        if (this.game.game_over()) {
            if (this.game.in_checkmate()) {
                if (this.game.turn() === "w") {
                    gameState = "Checkmate - Black Wins" //checkmate logic
                } else gameState = "Checkmate - White Wins"
            } else if (this.game.in_draw()) {
                if (this.game.in_stalemate()) {
                    if (this.game.turn() === "w") {
                        gameState = "White's Move - Stalemate" // stalemate logic
                    } else gameState = "Black's Move - Stalemate"
                } else if (this.game.insufficient_material()) {
                    gameState = "Draw - Insufficient Material"
                }
            }
        } else if (this.game.in_check()) {
            if (this.game.turn() === "w") {
                gameState = "White's Move (in check)"
            } else gameState = "Black's Move (in check)"
        } else {
            if (this.game.turn() === "w") {
                gameState = "White's Move"
            } else gameState = "Black's Move"
        }

        return gameState
    }

    sendGameState = () => {
        this.props.setGameState_parentCallback(this.state.gameStatus) // takes a values and sends it to the parent
    }

    render() {
        const { fen, dropSquareStyle, squareStyles } = this.state

        this.sendGameState()
        // console.log(this.state.gameStatus)

        return this.props.children({
            squareStyles,
            width: 600,
            position: fen,
            onMouseOverSquare: this.onMouseOverSquare,
            onMouseOutSquare: this.onMouseOutSquare,
            onDrop: this.onDrop,
            dropSquareStyle,
            onDragOverSquare: this.onDragOverSquare,
            onSquareClick: this.onSquareClick,
            onSquareRightClick: this.onSquareRightClick,
        })
    }
}

export default function WithMoveValidation(props) {
    const childRef = useRef()
    const fenRef = useRef()

    const [gameState, setGameState] = useState("")
    const [selectPiecePromotion, setSelectPiecePromotion] = useState(false)
    const [promoteType, setpromoteType] = useState("q")

    const setGameState_callbackFunction = (childData) => {
        setGameState(childData)
    }

    const handle_setPromoteType = (type) => {
        setpromoteType(type)
        console.log(promoteType)
    }

    const togglePromotionPopup = () => {
        setSelectPiecePromotion(!selectPiecePromotion)
    }

    return (
        <div>
            <div className='chessboard-board'>
                <HumanVsHuman
                    testPopup={() => {
                        props.togglePopup()
                    }}
                    setGameState_parentCallback={setGameState_callbackFunction}
                    ref={childRef}
                    togglePromote={togglePromotionPopup}
                    promoteType={promoteType}
                >
                    {({ width, position, onDrop, onMouseOverSquare, onMouseOutSquare, squareStyles, dropSquareStyle, onDragOverSquare, onSquareClick, onSquareRightClick }) => (
                        <Chessboard
                            id='humanVsHuman'
                            width={width}
                            position={position}
                            onDrop={onDrop}
                            onMouseOverSquare={onMouseOverSquare}
                            onMouseOutSquare={onMouseOutSquare}
                            boardStyle={{
                                borderRadius: "5px",
                                boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`,
                            }}
                            squareStyles={squareStyles}
                            dropSquareStyle={dropSquareStyle}
                            onDragOverSquare={onDragOverSquare}
                            onSquareClick={onSquareClick}
                            onSquareRightClick={onSquareRightClick}
                        />
                    )}
                </HumanVsHuman>
            </div>
            <div>
                <h1>{gameState}</h1>

                <div className='btn'>
                    <button
                        onClick={() => {
                            if (childRef.current) {
                                childRef.current.undoMove()
                            }
                        }}
                    >
                        Undo Move
                    </button>
                </div>
                <h4>Fen input:</h4>
                <input type='text' ref={fenRef} placeholder='Enter valid FEN here' />
                <button
                    onClick={() => {
                        if (childRef.current) {
                            childRef.current.setFen(fenRef.current.value) ? (fenRef.current.value = null) : console.log("Load Failed - INVALID FEN")
                        }
                    }}
                >
                    Set Fen
                </button>
                {/* <p>BOOL Invalid FEN</p> */}
                {selectPiecePromotion ? <PromotePopup togglePopup={togglePromotionPopup} setPromote={handle_setPromoteType} /> : null}
            </div>
        </div>
    )
}

const squareStyling = ({ pieceSquare, history }) => {
    const sourceSquare = history.length && history[history.length - 1].from
    const targetSquare = history.length && history[history.length - 1].to

    return {
        [pieceSquare]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
        ...(history.length && {
            [sourceSquare]: {
                backgroundColor: "rgba(200, 100, 60, 0.5)",
            },
        }),
        ...(history.length && {
            [targetSquare]: {
                backgroundColor: "rgba(200, 100, 60, 0.5)",
                // backgroundColor: "rgba(0, 255, 0, 0.4)",
            },
        }),
    }
}

// const chess = new Chess()

// const isPromote = (from, to) => {
//     const promotions = chess.moves({ verbose: true }).filter((m) => m.promotion)
//     console.table(promotions)
//     console.log(`${from}:${to}`)
// }

// is_promotion(cfg) {
//     var piece = cfg.chess.get(cfg.move.from);
//     if (
//         cfg.chess.turn() == 'w' &&
//         cfg.move.from.charAt(1) == 7 &&
//         cfg.move.to.charAt(1) == 8 &&
//         piece.type == 'p' &&
//         piece.color == 'w'
// //...
// //analogical for black :)
//     ) {
//         var temp_chess(chess.fen());
//         if ( temp_chess.move({from: cfg.move.from, to: cfg.move.to, promotion: 'q'}) ) {
//                 return true;
//         } else {
//                 return false;
//         }
//     }
// }
