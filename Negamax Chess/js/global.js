var BRD_SQ_NUM = 120;

var COLOURS = { WHITE:0, BLACK:1, BOTH:2 };

var PIECES =  { EMPTY : 0, wP : 1, wN : 2, wB : 3,wR : 4, wQ : 5, wK : 6,
              bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12  };

var RANKS =  { RANK_1:0, RANK_2:1, RANK_3:2, RANK_4:3,
    RANK_5:4, RANK_6:5, RANK_7:6, RANK_8:7, RANK_NONE:8 };

var FILES =  { FILE_A:0, FILE_B:1, FILE_C:2, FILE_D:3,
	FILE_E:4, FILE_F:5, FILE_G:6, FILE_H:7, FILE_NONE:8 };

var CASTLEBIT = { WKCA : 1, WQCA : 2, BKCA : 4, BQCA : 8 };

var SQUARES = {
  A1:21, B1:22, C1:23, D1:24, E1:25, F1:26, G1:27, H1:28,
  A8:91, B8:92, C8:93, D8:94, E8:95, F8:96, G8:97, H8:98,
  NO_SQ:99, OFFBOARD:100
};

var BOOL = { FALSE:0, TRUE:1 };

var MAXGAMEMOVES = 2048;
var MAXPOSITIONMOVES = 256;
var MAXDEPTH = 64;
var INFINITE = 40000;
var MATE = 39000;
var PVENTRIES = 10000;

var FilesBrd = new Array(BRD_SQ_NUM);
var RanksBrd = new Array(BRD_SQ_NUM);

var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

var PceChar = ".PNBRQKpnbrqk";
var SideChar = "wb-";
var RankChar = "12345678";
var FileChar = "abcdefgh";

var PieceVal= [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];

var KnDir = [ -8, -19,	-21, -12, 8, 19, 21, 12 ]; //directions that knight moves
var RkDir = [ -1, -10,	1, 10 ];
var BiDir = [ -9, -11, 11, 9 ];
var KiDir = [ -1, -10,	1, 10, -9, -11, 11, 9 ];

var DirNum = [ 0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8 ]; //number of unique directions piece can move
var PceDir = [ 0, 0, KnDir, BiDir, RkDir, KiDir, KiDir, 0, KnDir, BiDir, RkDir, KiDir, KiDir ];

function getNonSlideIndex(side){return side ? 3 : 0};
var LoopNonSlidePce = [ PIECES.wN, PIECES.wK, 0, PIECES.bN, PIECES.bK, 0 ];
function getSlideIndex(side){return side ? 4 : 0};
var LoopSlidePce = [ PIECES.wB, PIECES.wR, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bQ, 0 ];

var PieceKeys = new Array(12 * 120); //12 piece types and 120 possible squares for each piece
var SideKey;
var CastleKeys = new Array(16); //15 = 1111, coded for each castling

var Sq120ToSq64 = new Array(BRD_SQ_NUM);
var Sq64ToSq120 = new Array(64);

var Kings = [PIECES.wK, PIECES.bK];

function getCastlePerm(index){
    switch(index){
        case 21:
            return 13;
            break;
        case 25:
            return 12;
            break;
        case 28:
            return 14;
            break;
        case 91:
            return 7;
            break;
        case 95:
            return 3;
            break;
        case 98:
            return 11;
            break;
        default:
            return 15;
    }
}

var MFLAGEP = 0x40000; //en passant
var MFLAGPS = 0x80000;  //pawn start
var MFLAGCA = 0x1000000;    //castling

var MFLAGCAP = 0x7C000; //captured
var MFLAGPROM = 0xF00000;   //promoted

var NOMOVE = 0;

var controller = {};
controller.EngineSide = COLOURS.BOTH;
controller.PlayerSide = COLOURS.BOTH;
controller.GameOver = BOOL.FALSE;

var UserMove = {};
UserMove.from = SQUARES.NO_SQ;
UserMove.to = SQUARES.NO_SQ;

var game = {};

game.pieces = new Array(BRD_SQ_NUM); //holds all squares (120)
game.side = COLOURS.WHITE;
game.fiftyMove = 0; //count of moves made for 50 move rule
game.hisPly = 0;	//depth search tree for whole game eg. hisply=6 at 40+ moves
game.history = [];
game.ply = 0; //depth of search tree
game.enPas = 0;
game.castlePerm = 0;	//permission to castle
game.material = new Array(2); // material of pieces
game.pceNum = new Array(13); // number on board for each piece type
game.pList = new Array(12 * 10);	//list of squares occupied by pieces - 12 types and up to 10 pieces per type
game.posKey = 0;
game.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
game.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
game.moveListStart = new Array(MAXDEPTH);
game.movePosKey = [];
game.PvArray = new Array(MAXDEPTH);
game.searchHistory = new Array( 14 * BRD_SQ_NUM);
game.killerMoves = new Array(3 * MAXDEPTH);