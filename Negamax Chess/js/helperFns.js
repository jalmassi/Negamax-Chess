
function FR2SQ(f,r) {
	return ( (21 + (f) ) + ( (r) * 10 ) );
}

function pieceCol(index) {
	if(!index){
		return COLOURS.BOTH; }
   	else if(index<7){
	   return COLOURS.WHITE; }
	else{
		return COLOURS.BLACK; }
	}

		//sq120 -> sq64
function sq64(sq120) {
	return Sq120ToSq64[(sq120)];
}

function pieceIndex(pce, pceNum) {
	return (pce * 10 + pceNum);
}

//sq64 -> sq120
function SQ120(sq64) {
	return Sq64ToSq120[(sq64)];
}

//get index of piece
function pieceIndex(pce, pceNum) {
	return (pce * 10 + pceNum);
}

function mirror(sq) {
	return Mirror64[sq];
}

function sqOffBoard(sq) {
	if(FilesBrd[sq]==SQUARES.OFFBOARD) return BOOL.TRUE;
	return BOOL.FALSE;
}

// for position key
function pieceHash(pce, sq) {
	game.posKey ^= PieceKeys[(pce * 120) + sq];
}

function fromSq(m) { return (m & 0x7F); }
function toSq(m) { return ( (m >> 7) & 0x7F); }
function capturedP(m) { return ( (m >> 14) & 0xF); }
function promotedP(m) { return ( (m >> 20) & 0xF); }

function HASH_CA() { game.posKey ^= CastleKeys[game.castlePerm]; }
function HASH_SIDE() { game.posKey ^= SideKey; }
function HASH_EP() { game.posKey ^= PieceKeys[game.enPas]; }

function pieceBig(index) {return ((index>1 && index<7)||(index>7 && index<13)) ? BOOL.TRUE : BOOL.FALSE}
function pieceMaj(index){return ((index>3 && index<7) || (index>9 || index<13)) ? BOOL.TRUE : BOOL.FALSE}
function pieceMin(index){return (index==2 || index==3 || index==8 || index==9) ? BOOL.TRUE : BOOL.FALSE}

function piecePawn(index){return (index==1 || index==7) ? BOOL.TRUE : BOOL.FALSE}
function pieceKnight(index){return (index==2 || index==8) ? BOOL.TRUE : BOOL.FALSE}
function pieceKing(index){return (index==6 || index==12) ? BOOL.TRUE : BOOL.FALSE}
function pieceRookQueen(index){return (index==4 || index==5 || index==10 || index==11) ? BOOL.TRUE : BOOL.FALSE}
function pieceBishopQueen(index){return (index==3 || index==5 || index==9 || index==11) ? BOOL.TRUE : BOOL.FALSE}
function pieceSlides(index){return ((index>2 && index<6) || (index>8 || index<12)) ? BOOL.TRUE : BOOL.FALSE}

//gives unique position key by { key ^= RandNum for all pieces on squares} - signify move/capture/remove piece by xor piece again
function randomize() {

	return (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16)
		 | (Math.floor((Math.random()*255)+1) << 8) | Math.floor((Math.random()*255)+1);

}
/*
0000 0000 0000 0000 0000 0111 1111 -> From 0x7F
0000 0000 0000 0011 1111 1000 0000 -> To
0000 0000 0011 1100 0000 0000 0000 -> captured
0000 0000 0100 0000 0000 0000 0000 -> en passant
0000 0000 1000 0000 0000 0000 0000 -> Pawn Start
0000 1111 0000 0000 0000 0000 0000 -> Promoted Piece
0001 0000 0000 0000 0000 0000 0000 -> Castle    */
