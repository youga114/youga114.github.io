/** @jsxImportSource @emotion/react */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import Button from "./Button";

type BLOCKS = {
    key: number;
    shape: number;
    y: number;
    x: number;
    color: string;
}[];

const Game = () => {
    const getChatingEnterKey = useRef<(event: KeyboardEvent) => void>();
    const getChatingEnterKeyListener = useCallback((event: KeyboardEvent) => {
        getChatingEnterKey.current?.(event);
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", getChatingEnterKeyListener, false);
        return () => {
            window.removeEventListener(
                "keydown",
                getChatingEnterKeyListener,
                false
            );
        };
    }, []);

    const timeIntervalId = useRef<number>();
    const downBlock = useRef<() => void>();
    const [rank, setRank] = useState("");
    const [blocks, setBlocks] = useState<BLOCKS>([]);
    const [waitingBlocks, setWaitingBlocks] = useState<BLOCKS[]>([[], []]);
    const [isPlaying, setIsPlaying] = useState(false);

    const finishGame = useCallback((blocks: BLOCKS) => {
        window.removeEventListener("keydown", gameControllKeyListener, false);
        clearInterval(timeIntervalId.current);

        for (let i = 0; i < blocks.length; i++) {
            blocks[i].color = "rgb(166,166,166)";
        }

        setIsPlaying(false);

        setWaitingBlocks((prevWaitingBlocks) =>
            prevWaitingBlocks.map((waitingBlock) => {
                return waitingBlock.map((block) => {
                    return { ...block, color: "rgb(166,166,166)" };
                });
            })
        );

        return blocks;
    }, []);

    const gameStart = useCallback(() => {
        window.addEventListener("keydown", gameControllKeyListener, false);

        blockKey = 1;

        setRank("");
        setBlocks(getMainBlock(createPreviewBlock()));

        let waitingBlock = [createPreviewBlock(), createPreviewBlock()];
        setWaitingBlocks(waitingBlock);

        timeIntervalId.current = setInterval(() => {
            downBlock.current?.();
        }, dropMilliseconds);
    }, []);

    downBlock.current = useCallback(() => {
        let downedBlocks = blocks.map((block) => {
            return { ...block };
        });

        for (let i = downedBlocks.length - 4; i < downedBlocks.length; i++) {
            downedBlocks[i].y += BLOCK.HEIGHT;
        }

        if (isOverd(downedBlocks) === false) {
            setBlocks(downedBlocks);

            return;
        }

        for (let i = downedBlocks.length - 4; i < downedBlocks.length; i++) {
            downedBlocks[i].y -= BLOCK.HEIGHT;
        }

        downedBlocks = clearFilledLine(downedBlocks);

        downedBlocks.push(...getMainBlock(waitingBlocks[0]));

        let waitingBlock = [waitingBlocks[1], createPreviewBlock()];
        setWaitingBlocks(waitingBlock);

        if (isOverd(downedBlocks) === true) {
            downedBlocks = finishGame(downedBlocks);
        }

        setBlocks(downedBlocks);
    }, [blocks]);

    const clearFilledLine = useCallback((blocks: BLOCKS) => {
        let cloneBlocks = blocks.map((block) => {
            return { ...block };
        });

        for (let i = cloneBlocks.length - 4; i < cloneBlocks.length; i++) {
            let sameHeightBlockIdx = [];
            let blockHeight = cloneBlocks[i].y;
            for (let j = 0; j < blocks.length; j++) {
                if (blocks[j].y === blockHeight) {
                    sameHeightBlockIdx.push(j);
                }
            }
            if (sameHeightBlockIdx.length > 9) {
                for (let j = 0; j < blocks.length; j++) {
                    if (blocks[j].y < blockHeight) {
                        blocks[j].y += BLOCK.HEIGHT;
                    }
                }
                for (let k = 9; k >= 0; k--) {
                    blocks.splice(sameHeightBlockIdx[k], 1);
                }
            }
        }

        return blocks;
    }, []);

    const getGameControllKey = useRef<(event: KeyboardEvent) => void>();
    const gameControllKeyListener = useCallback((event: KeyboardEvent) => {
        getGameControllKey.current?.(event);
    }, []);

    getGameControllKey.current = (event) => {
        let keyCode = event.keyCode;
        event.preventDefault();

        let movedBlocks = blocks.map((block) => {
            return { ...block };
        });

        switch (keyCode) {
            case KEY_CODE.SPACE:
                let downedBlocks = blocks.map((block) => {
                    return { ...block };
                });

                while (isOverd(downedBlocks) === false) {
                    for (
                        let i = downedBlocks.length - 4;
                        i < downedBlocks.length;
                        i++
                    ) {
                        downedBlocks[i].y += BLOCK.HEIGHT;
                    }
                }

                for (
                    let i = downedBlocks.length - 4;
                    i < downedBlocks.length;
                    i++
                ) {
                    downedBlocks[i].y -= BLOCK.HEIGHT;
                }

                downedBlocks = clearFilledLine(downedBlocks);

                downedBlocks.push(...getMainBlock(waitingBlocks[0]));

                let waitingBlock = [waitingBlocks[1], createPreviewBlock()];
                setWaitingBlocks(waitingBlock);

                if (isOverd(downedBlocks) === true) {
                    downedBlocks = finishGame(downedBlocks);
                }

                setBlocks(downedBlocks);
                break;
            case KEY_CODE.LEFT:
                for (
                    let i = movedBlocks.length - 4;
                    i < movedBlocks.length;
                    i++
                ) {
                    movedBlocks[i].x -= BLOCK.WIDTH;
                }

                if (isOverd(movedBlocks) === true) {
                    return;
                }

                setBlocks(movedBlocks);
                break;
            case KEY_CODE.UP:
                rotateBlock();
                break;
            case KEY_CODE.RIGHT:
                for (
                    let i = movedBlocks.length - 4;
                    i < movedBlocks.length;
                    i++
                ) {
                    movedBlocks[i].x += BLOCK.WIDTH;
                }

                if (isOverd(movedBlocks) === true) {
                    return;
                }

                setBlocks(movedBlocks);
                break;
            case KEY_CODE.DOWN:
                downBlock.current?.();
                break;
            default:
                break;
        }
    };

    const rotateBlock = useCallback(() => {
        if (blocks[blocks.length - 1].shape === BLOCK_SHAPE.SQUARE) {
            return;
        }

        let rotatedBlocks = blocks.map((block) => {
            return { ...block };
        });

        let centerX = rotatedBlocks[rotatedBlocks.length - 4].x;
        let centerY = rotatedBlocks[rotatedBlocks.length - 4].y;

        for (
            let i = rotatedBlocks.length - NUMBER_OF_BLOCKS;
            i < rotatedBlocks.length;
            ++i
        ) {
            const dx = rotatedBlocks[i].x - centerX;
            const dy = rotatedBlocks[i].y - centerY;
            rotatedBlocks[i].y = centerY + dx;
            rotatedBlocks[i].x = centerX - dy;
        }

        if (isOverd(rotatedBlocks) === true) {
            for (
                let i = rotatedBlocks.length - 4;
                i < rotatedBlocks.length;
                i++
            ) {
                rotatedBlocks[i].x += BLOCK.WIDTH;
            }
        }

        if (isOverd(rotatedBlocks) === true) {
            for (
                let i = rotatedBlocks.length - 4;
                i < rotatedBlocks.length;
                i++
            ) {
                rotatedBlocks[i].x -= BLOCK.WIDTH * 2;
            }
        }

        if (isOverd(rotatedBlocks) === true) {
            return;
        }

        setBlocks(rotatedBlocks);
    }, [blocks]);

    return (
        <Body>
            <Left></Left>
            <Center>
                <ColCenter>
                    <PreviewWindows>
                        {waitingBlocks.map((waitingBlock, index) => (
                            <PreviewWindow key={index}>
                                <PreviewCenter>
                                    {waitingBlock.map((item) => {
                                        let y = item.y;
                                        let x = item.x;

                                        if (item.shape === BLOCK_SHAPE.SQUARE) {
                                            x -= BLOCK.WIDTH / 2;
                                        } else if (
                                            item.shape === BLOCK_SHAPE.LINEAR
                                        ) {
                                            x -= BLOCK.WIDTH / 2;
                                            y -= BLOCK.HEIGHT / 2;
                                        }

                                        let blockStyle = {
                                            top: y + BLOCK.HEIGHT,
                                            left: x,
                                            backgroundColor: item.color,
                                        };
                                        return (
                                            <div
                                                key={item.key}
                                                css={PreviewBlockStyle}
                                                style={blockStyle}
                                            />
                                        );
                                    })}
                                </PreviewCenter>
                            </PreviewWindow>
                        ))}
                    </PreviewWindows>
                    <GameWindow key="1">
                        {blocks.map((item) => {
                            let blockStyle = {
                                top: item.y,
                                left: item.x,
                                backgroundColor: item.color,
                            };
                            return (
                                <div
                                    key={item.key}
                                    css={BlockStyle}
                                    style={blockStyle}
                                />
                            );
                        })}
                        {<Ranking>{rank}</Ranking>}
                    </GameWindow>
                </ColCenter>
            </Center>
            <Right>
                <div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "end",
                        }}
                    >
                        {!isPlaying && (
                            <div onClick={gameStart}>
                                <Button>시작하기</Button>
                            </div>
                        )}
                        {isPlaying ? (
                            <Link to="/" style={{ textDecoration: "none" }}>
                                <Button>돌아가기</Button>
                            </Link>
                        ) : (
                            <Button>돌아가기</Button>
                        )}
                    </div>
                </div>
            </Right>
        </Body>
    );
};

export default React.memo(Game);

const KEY_CODE = {
    ENTER: 13,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
};

const BLOCK_SHAPE = {
    SQUARE: 0,
    LINEAR: 1,
    FALCI_SHAPE: 2,
    REVERSE_FALCI_SHAPE: 3,
    MOUNTINE_SHAPE: 4,
    BENT_UP_LINE: 5,
    BENT_DOWN_LINE: 6,
    DEAD: 7,
};

const BLOCK = {
    WIDTH: 20,
    HEIGHT: 20,
    BORDER_WIDTH: 2,
};

const GAME_WINDOW = {
    WIDTH: BLOCK.WIDTH * 10,
    HEIGHT: BLOCK.HEIGHT * 20,
    BORDER_WIDTH: 5,
};

const PREVIEW_WINDOW = {
    WIDTH: BLOCK.WIDTH * 5,
    HEIGHT: BLOCK.HEIGHT * 4,
    BORDER_WIDTH: 4,
};

const NUMBER_OF_BLOCKS = 4;

const Body = styled("div")`
    height: 80vh;
    width: 100%;
    margin: 5vh 0px;
    display: flex;
    justify-content: center;
`;
const Left = styled.div`
    margin: 50px 0px;
    width: 600px;
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
    &:empty {
        width: 0px;
        margin: 0px;
    }
`;
const Center = styled.div`
    margin: 5vh 3vw;
    width: 500px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
`;
const GameWindow = styled.div`
    position: relative;
    border-width: ${GAME_WINDOW.BORDER_WIDTH}px;
    border-color: white;
    border-style: solid;
    background-color: #222;
    width: ${GAME_WINDOW.WIDTH}px;
    height: ${GAME_WINDOW.HEIGHT}px;
    overflow: hidden;
`;
const PreviewWindows = styled.div`
    position: relative;
    width: ${PREVIEW_WINDOW.WIDTH}px;
    height: ${PREVIEW_WINDOW.HEIGHT * 2 + PREVIEW_WINDOW.BORDER_WIDTH * 4}px;
    overflow: hidden;
`;
const PreviewWindow = styled.div`
    position: relative;
    border-width: ${PREVIEW_WINDOW.BORDER_WIDTH}px;
    border-color: white;
    border-style: solid;
    background-color: #222;
    width: ${PREVIEW_WINDOW.WIDTH}px;
    height: ${PREVIEW_WINDOW.HEIGHT}px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
`;
const PreviewCenter = styled.div`
    position: relative;
    left: ${BLOCK.WIDTH / 2}px;
`;
const PreviewBlockStyle = css`
    position: absolute;
    border-width: ${BLOCK.BORDER_WIDTH}px;
    border-color: white;
    border-style: outset;
    width: ${BLOCK.WIDTH - BLOCK.BORDER_WIDTH * 2}px;
    height: ${BLOCK.HEIGHT - BLOCK.BORDER_WIDTH * 2}px;
`;
const Right = styled.div`
    margin: 5vh 5vw;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
`;
const BlockStyle = css`
    position: absolute;
    border-width: ${BLOCK.BORDER_WIDTH}px;
    border-color: white;
    border-style: outset;
    width: ${BLOCK.WIDTH - BLOCK.BORDER_WIDTH * 2}px;
    height: ${BLOCK.HEIGHT - BLOCK.BORDER_WIDTH * 2}px;
`;
const Ranking = styled.div`
    position: absolute;
    color: white;
    font-size: 80px;
    left: 75px;
    top: 135px;
    -webkit-text-stroke: 2px black;
    text-stroke: 2px black;
    text-shadow: black 1px 0 10px;
`;
const ColCenter = styled.div`
    display: flex;
    justify-content: center;
`;

let blockKey = 1;
let dropMilliseconds = 300;

const createPreviewBlock: () => BLOCKS = () => {
    switch (Math.floor(Math.random() * 7)) {
        case BLOCK_SHAPE.SQUARE:
            return [
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.SQUARE,
                    y: -BLOCK.HEIGHT * 2,
                    x: -BLOCK.WIDTH,
                    color: "red",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.SQUARE,
                    y: -BLOCK.HEIGHT * 2,
                    x: 0,
                    color: "red",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.SQUARE,
                    y: -BLOCK.HEIGHT,
                    x: -BLOCK.WIDTH,
                    color: "red",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.SQUARE,
                    y: -BLOCK.HEIGHT,
                    x: 0,
                    color: "red",
                },
            ];
        case BLOCK_SHAPE.LINEAR:
            return [
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.LINEAR,
                    y: -BLOCK.HEIGHT,
                    x: -BLOCK.WIDTH,
                    color: "purple",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.LINEAR,
                    y: -BLOCK.HEIGHT,
                    x: -BLOCK.WIDTH * 2,
                    color: "purple",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.LINEAR,
                    y: -BLOCK.HEIGHT,
                    x: 0,
                    color: "purple",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.LINEAR,
                    y: -BLOCK.HEIGHT,
                    x: BLOCK.WIDTH,
                    color: "purple",
                },
            ];
        case BLOCK_SHAPE.FALCI_SHAPE:
            return [
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.FALCI_SHAPE,
                    y: -BLOCK.HEIGHT * 2,
                    x: -BLOCK.WIDTH,
                    color: "pink",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.FALCI_SHAPE,
                    y: -BLOCK.HEIGHT * 2,
                    x: 0,
                    color: "pink",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.FALCI_SHAPE,
                    y: -BLOCK.HEIGHT * 2,
                    x: -BLOCK.WIDTH * 2,
                    color: "pink",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.FALCI_SHAPE,
                    y: -BLOCK.HEIGHT,
                    x: 0,
                    color: "pink",
                },
            ];
        case BLOCK_SHAPE.REVERSE_FALCI_SHAPE:
            return [
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.REVERSE_FALCI_SHAPE,
                    y: -BLOCK.HEIGHT * 2,
                    x: -BLOCK.WIDTH,
                    color: "yellow",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.REVERSE_FALCI_SHAPE,
                    y: -BLOCK.HEIGHT * 2,
                    x: -BLOCK.WIDTH * 2,
                    color: "yellow",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.REVERSE_FALCI_SHAPE,
                    y: -BLOCK.HEIGHT * 2,
                    x: 0,
                    color: "yellow",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.REVERSE_FALCI_SHAPE,
                    y: -BLOCK.HEIGHT,
                    x: -BLOCK.WIDTH * 2,
                    color: "yellow",
                },
            ];
        case BLOCK_SHAPE.MOUNTINE_SHAPE:
            return [
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.MOUNTINE_SHAPE,
                    y: -BLOCK.HEIGHT * 2,
                    x: -BLOCK.WIDTH,
                    color: "orange",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.MOUNTINE_SHAPE,
                    y: -BLOCK.HEIGHT * 2,
                    x: -BLOCK.WIDTH * 2,
                    color: "orange",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.MOUNTINE_SHAPE,
                    y: -BLOCK.HEIGHT * 2,
                    x: 0,
                    color: "orange",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.MOUNTINE_SHAPE,
                    y: -BLOCK.HEIGHT,
                    x: -BLOCK.WIDTH,
                    color: "orange",
                },
            ];
        case BLOCK_SHAPE.BENT_UP_LINE:
            return [
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.BENT_UP_LINE,
                    y: -BLOCK.HEIGHT * 2,
                    x: -BLOCK.WIDTH,
                    color: "green",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.BENT_UP_LINE,
                    y: -BLOCK.HEIGHT,
                    x: -BLOCK.WIDTH * 2,
                    color: "green",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.BENT_UP_LINE,
                    y: -BLOCK.HEIGHT * 2,
                    x: 0,
                    color: "green",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.BENT_UP_LINE,
                    y: -BLOCK.HEIGHT,
                    x: -BLOCK.WIDTH,
                    color: "green",
                },
            ];
        case BLOCK_SHAPE.BENT_DOWN_LINE:
            return [
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.BENT_DOWN_LINE,
                    y: -BLOCK.HEIGHT * 2,
                    x: -BLOCK.WIDTH,
                    color: "blue",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.BENT_DOWN_LINE,
                    y: -BLOCK.HEIGHT,
                    x: 0,
                    color: "blue",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.BENT_DOWN_LINE,
                    y: -BLOCK.HEIGHT * 2,
                    x: -BLOCK.WIDTH * 2,
                    color: "blue",
                },
                {
                    key: blockKey++,
                    shape: BLOCK_SHAPE.BENT_DOWN_LINE,
                    y: -BLOCK.HEIGHT,
                    x: -BLOCK.WIDTH,
                    color: "blue",
                },
            ];
        default:
            return [];
    }
};

const getMainBlock = (blocks: BLOCKS) => {
    blocks.forEach((block) => {
        block.x += GAME_WINDOW.WIDTH / 2;
    });

    return blocks;
};

const isOverd = (blocks: BLOCKS) => {
    for (let i = blocks.length - 4; i < blocks.length; ++i) {
        if (
            blocks[i].y >= GAME_WINDOW.HEIGHT ||
            blocks[i].x >= GAME_WINDOW.WIDTH ||
            blocks[i].x < 0
        ) {
            return true;
        }

        for (let j = 0; j < blocks.length - 4; ++j) {
            if (blocks[i].y === blocks[j].y && blocks[i].x === blocks[j].x) {
                return true;
            }
        }
    }

    return false;
};
