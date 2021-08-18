import React, { Component, useState, useRef } from "react"
import PropTypes from "prop-types"
import Chess from "chess.js"
import "../App.css"

import PromotePopup from "../elements/PromotePopup"

import Chessboard from "chessboardjsx"

const STOCKFISH = window.STOCKFISH
const game = new Chess()

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

        gameModeTracker: null,
    }

    componentDidMount() {
        // this.game = new Chess()

        // stockfish
        this.setState({ fen: game.fen() })
        this.engineGame().prepareMove()
    }

    componentWillUnmount() {
        if (this.props.gameMode === 0) {
            window.clearTimeout(this.timer())
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.gameMode === 0 && prevState.gameModeTracker !== 0) {
            this.setState({
                gameModeTracker: this.props.gameMode,
            })
            setTimeout(() => this.pcVpc(), 2000)
        } else {
            window.clearTimeout(this.timer())
            if (prevState.gameModeTracker !== prevProps.gameMode) {
                this.setState({
                    gameModeTracker: this.props.gameMode,
                })
            }
        }
    }

    updateBoard() {
        this.setState({
            fen: game.fen(),
            history: game.history({ verbose: true }),
            pieceSquare: "",
            // squareStyles: squareStyling({ pieceSquare: square, state.history }),
            gameStatus: this.gameOverType(),
        })
    }

    setFen(fen) {
        const loadSuccess = game.load(fen)
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
        let move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // always promote to a queen for example simplicity
        })

        // illegal move
        if (move === null) return

        // this.setState(({ history, pieceSquare }) => ({
        //     fen: game.fen(),
        //     history: game.history({ verbose: true }),
        //     squareStyles: squareStyling({ pieceSquare, history }),
        //     gameStatus: this.gameOverType(),
        // }))

        return new Promise((resolve) => {
            this.setState(({ history, pieceSquare }) => ({
                fen: game.fen(),
                history: game.history({ verbose: true }),
                squareStyles: squareStyling({ pieceSquare, history }),
                gameStatus: this.gameOverType(),
            }))
            resolve()
        }).then(() => this.engineGame().prepareMove())
    }

    // onMouseOverSquare = (square) => {
    //     // get list of possible moves for this square
    //     let moves = game.moves({
    //         square: square,
    //         verbose: true,
    //     })
    //     // console.log(game.moves);

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
        let moves = game.moves({
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
        let moves = game.moves({
            square: square,
            verbose: true,
        })
        // console.log(game.moves);

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
        if (game.game_over()) return
        this.setState(({ history }) => ({
            squareStyles: squareStyling({ pieceSquare: move !== null ? square : "", history }),
            pieceSquare: square,
        }))

        this.highlightMoves(square)

        let promoteType = "q"

        // promotion logic
        if (this.isPromoting(this.state.pieceSquare, square)) {
            console.log("promote")
            promoteType = this.props.showModalTest()
            // this.props.togglePromote()
            console.log(promoteType)
        }
        let move = game.move({
            from: this.state.pieceSquare,
            to: square,
            promotion: promoteType, //isPromote(this.state.pieceSquare, square), //this.props.testPopup(), // always promote to a queen for example simplicity
        })

        // illegal move
        if (move === null) return

        // console.log(this.state.pieceSquare)
        // console.log(square)
        // console.log(game.get(square))

        // game.move.promotion = promotionType

        this.setState({
            fen: game.fen(),
            history: game.history({ verbose: true }),
            pieceSquare: "",
            gameStatus: this.gameOverType(),
            // squareStyles: squareStyling({ pieceSquare: square, state.history }),
        })

        console.log(game.fen()) //temp

        // random computer move
        if (this.props.gameMode === 1) {
            window.setTimeout(this.makeRandomMove(), 1000)
        }
    }

    isPromoting(from, to) {
        const chess = game
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
        // return true
        return chess
            .moves({ square: from, verbose: true })
            .map((it) => it.to)
            .includes(to)
    }

    onSquareRightClick = (square) => {
        this.setState({
            squareStyles: { [square]: { backgroundColor: "deepPink" } },
        })
    }

    undoMove = () => {
        game.undo()
        this.setState({
            fen: game.fen(),
            history: game.history({ verbose: true }),
            pieceSquare: "",
            // squareStyles: squareStyling({ pieceSquare: square, state.history }),
            gameStatus: this.gameOverType(),
        })
    }

    timer = () => window.setTimeout(() => this.pcVpc(), 2000)

    pcVpc() {
        this.makeRandomMove()
        this.props.pcLoading(false)
        if (this.props.gameMode === 0) {
            this.props.pcLoading(true)
            this.timer()
        }
        console.log("pcVpc")
    }

    makeRandomMove() {
        var possibleMoves = game.moves()

        // game over
        if (game.game_over() === true || game.in_draw() === true || possibleMoves.length === 0) return
        console.log(possibleMoves)
        var randomIndex = Math.floor(Math.random() * possibleMoves.length)
        game.move(possibleMoves[randomIndex])
        // this.setState(({ history, pieceSquare }) => ({
        //     fen: game.fen(),
        //     history: game.history({ verbose: true }),
        //     squareStyles: squareStyling({ pieceSquare, history }),
        //     gameStatus: this.gameOverType(),
        // }))
        this.updateBoard()

        // this.setState({ fen: game.fen() })
    }

    // useImperativeHandle(this.props.ref, () => ({
    //     getAlert() {
    //         alert("getAlert from Child")
    //     }
    // }))

    gameOverType = () => {
        let gameState
        if (game.game_over()) {
            if (game.in_checkmate()) {
                if (game.turn() === "w") {
                    gameState = "Checkmate - Black Wins" //checkmate logic
                } else gameState = "Checkmate - White Wins"
            } else if (game.in_draw()) {
                if (game.in_stalemate()) {
                    if (game.turn() === "w") {
                        gameState = "White's Move - Stalemate" // stalemate logic
                    } else gameState = "Black's Move - Stalemate"
                } else if (game.insufficient_material()) {
                    gameState = "Draw - Insufficient Material"
                }
            }
        } else if (game.in_check()) {
            if (game.turn() === "w") {
                gameState = "White's Move (in check)"
            } else gameState = "Black's Move (in check)"
        } else {
            if (game.turn() === "w") {
                gameState = "White's Move"
            } else gameState = "Black's Move"
        }

        return gameState
    }

    // Stockfish

    engineGame = (options) => {
        options = options || {}

        /// We can load Stockfish via Web Workers or via STOCKFISH() if loaded from a <script> tag.
        let engine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker(options.stockfishjs || "stockfish.js")
        let evaler = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker(options.stockfishjs || "stockfish.js")
        let engineStatus = {}
        let time = { wtime: 3000, btime: 3000, winc: 1500, binc: 1500 }
        let playerColor = this.props.boardOrientation
        let clockTimeoutID = null
        // let isEngineRunning = false;
        let announced_game_over
        // do not pick up pieces if the game is over
        // only pick up pieces for White

        setInterval(function () {
            if (announced_game_over) {
                return
            }

            if (game.game_over()) {
                announced_game_over = true
            }
        }, 500)

        function uciCmd(cmd, which) {
            // console.log('UCI: ' + cmd);

            ;(which || engine).postMessage(cmd)
        }
        uciCmd("uci")

        function clockTick() {
            let t = (time.clockColor === "white" ? time.wtime : time.btime) + time.startTime - Date.now()
            let timeToNextSecond = (t % 1000) + 1
            clockTimeoutID = setTimeout(clockTick, timeToNextSecond)
        }

        function stopClock() {
            if (clockTimeoutID !== null) {
                clearTimeout(clockTimeoutID)
                clockTimeoutID = null
            }
            if (time.startTime > 0) {
                let elapsed = Date.now() - time.startTime
                time.startTime = null
                if (time.clockColor === "white") {
                    time.wtime = Math.max(0, time.wtime - elapsed)
                } else {
                    time.btime = Math.max(0, time.btime - elapsed)
                }
            }
        }

        function startClock() {
            if (game.turn() === "w") {
                time.wtime += time.winc
                time.clockColor = "white"
            } else {
                time.btime += time.binc
                time.clockColor = "black"
            }
            time.startTime = Date.now()
            clockTick()
        }

        function get_moves() {
            let moves = ""
            let history = game.history({ verbose: true })

            for (let i = 0; i < history.length; ++i) {
                let move = history[i]
                moves += " " + move.from + move.to + (move.promotion ? move.promotion : "")
            }

            return moves
        }

        const prepareMove = () => {
            stopClock()
            // this.setState({ fen: game.fen() });
            let turn = game.turn() === "w" ? "white" : "black"
            if (!game.game_over()) {
                // if (turn === playerColor) {
                if (turn !== playerColor) {
                    // playerColor = playerColor === 'white' ? 'black' : 'white';
                    uciCmd("position startpos moves" + get_moves())
                    uciCmd("position startpos moves" + get_moves(), evaler)
                    uciCmd("eval", evaler)

                    if (time && time.wtime) {
                        uciCmd("go " + (time.depth ? "depth " + time.depth : "") + " wtime " + time.wtime + " winc " + time.winc + " btime " + time.btime + " binc " + time.binc)
                    } else {
                        uciCmd("go " + (time.depth ? "depth " + time.depth : ""))
                    }
                    // isEngineRunning = true;
                }
                if (game.history().length >= 2 && !time.depth && !time.nodes) {
                    startClock()
                }
            }
            this.updateBoard()
        }

        evaler.onmessage = function (event) {
            let line

            if (event && typeof event === "object") {
                line = event.data
            } else {
                line = event
            }

            // console.log('evaler: ' + line);

            /// Ignore some output.
            if (line === "uciok" || line === "readyok" || line.substr(0, 11) === "option name") {
                return
            }
        }

        engine.onmessage = (event) => {
            let line

            if (event && typeof event === "object") {
                line = event.data
            } else {
                line = event
            }
            // console.log('Reply: ' + line);
            if (line === "uciok") {
                engineStatus.engineLoaded = true
            } else if (line === "readyok") {
                engineStatus.engineReady = true
            } else {
                let match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/)
                /// Did the AI move?
                if (match) {
                    // isEngineRunning = false;
                    game.move({ from: match[1], to: match[2], promotion: match[3] })
                    this.setState({ fen: game.fen() })
                    prepareMove()
                    uciCmd("eval", evaler)
                    //uciCmd("eval");
                    /// Is it sending feedback?
                } else if ((match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/))) {
                    engineStatus.search = "Depth: " + match[1] + " Nps: " + match[2]
                }

                /// Is it sending feed back with a score?
                if ((match = line.match(/^info .*\bscore (\w+) (-?\d+)/))) {
                    let score = parseInt(match[2], 10) * (game.turn() === "w" ? 1 : -1)
                    /// Is it measuring in centipawns?
                    if (match[1] === "cp") {
                        engineStatus.score = (score / 100.0).toFixed(2)
                        /// Did it find a mate?
                    } else if (match[1] === "mate") {
                        engineStatus.score = "Mate in " + Math.abs(score)
                    }

                    /// Is the score bounded?
                    if ((match = line.match(/\b(upper|lower)bound\b/))) {
                        engineStatus.score = ((match[1] === "upper") === (game.turn() === "w") ? "<= " : ">= ") + engineStatus.score
                    }
                }
            }
            // displayStatus();
        }
        return {
            start: function () {
                uciCmd("ucinewgame")
                uciCmd("isready")
                engineStatus.engineReady = false
                engineStatus.search = null
                prepareMove()
                announced_game_over = false
            },
            prepareMove: function () {
                prepareMove()
            },
        }
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
    const modalRef = useRef()

    const [gameMode, setgameMode] = useState(2) // 0 -> CvC || 1 -> CvH || 2 -> HvH
    const [gameState, setGameState] = useState("")
    const [selectPiecePromotion, setSelectPiecePromotion] = useState(false)
    const [promoteType, setpromoteType] = useState("q")
    const [boardOrientation, setboardOrientation] = useState("white")
    const [pcLoading, setpcLoading] = useState(false)

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

    const showModal = () => {
        const modal = modalRef.current
        let result
        setTimeout(async () => {
            try {
                // Wait user to confirm !
                result = await modal.show()

                switch (result) {
                    case "q":
                        alert("Promote to Queen?")
                        break

                    case "r":
                        alert("Promote to Rook?")
                        break

                    case "b":
                        alert("Promote to Bishop?")
                        break

                    case "n":
                        alert("Promote to Knight?")
                        break

                    default:
                        alert("No piece chosen!")
                }

                console.log("Promote to: " + result)
                return result
            } catch (err) {
                alert("CANCEL")
            }
        }, 100)
        console.log("Waiting user for confirmation ...")
        return "q"
    }

    return (
        <div>
            <div>
                <button
                    className={gameMode === 0 ? "active" : ""}
                    onClick={() => {
                        setgameMode(0)
                    }}
                >
                    PC vs PC
                </button>
                <button
                    className={gameMode === 1 ? "active" : ""}
                    onClick={() => {
                        setgameMode(1)
                    }}
                >
                    PC vs Human
                </button>
                <button
                    className={gameMode === 2 ? "active" : ""}
                    onClick={() => {
                        setgameMode(2)
                    }}
                >
                    Human vs Human
                </button>
            </div>
            <div className='chessboard-board'>
                <HumanVsHuman
                    gameMode={gameMode}
                    setGameState_parentCallback={setGameState_callbackFunction}
                    ref={childRef}
                    togglePromote={togglePromotionPopup}
                    showModalTest={showModal}
                    promoteType={promoteType}
                    pcLoading={(bool) => {
                        setpcLoading(bool)
                    }}
                    boardOrientation={boardOrientation}
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
                            orientation={boardOrientation}
                        />
                    )}
                </HumanVsHuman>
            </div>
            <div>
                <h1>{gameState}</h1>
                {pcLoading && <div class='spinner-border'></div>}
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
                <div className='btn'>
                    <button
                        onClick={() => {
                            boardOrientation === "white" ? setboardOrientation("black") : setboardOrientation("white")
                        }}
                    >
                        🔄 Rotate Board
                    </button>
                </div>
                <h4>
                    Fen input: <br></br>rnbqk2r/pp2P2p/2pP2pn/8/1b3p2/8/PPPQ1PPP/RNB1KBNR w KQkq - 1 9
                </h4>
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
                {/* {selectPiecePromotion ? <PromotePopup ref={modalRef} togglePopup={togglePromotionPopup} setPromote={handle_setPromoteType} /> : null} */}
                <PromotePopup ref={modalRef} togglePopup={togglePromotionPopup} setPromote={handle_setPromoteType} />
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
