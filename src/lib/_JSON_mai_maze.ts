// 利用クラス等の読み込み

// エラーメッセージ等を保存・表示するクラス
import { C_DspMessage }   from '@d_utl/C_DspMessage';

// ダンジョンマップのセルの種類を表す列挙型
import { T_MzKind }       from  '@d_mdl/T_MzKind';

// 方向を表すクラス
import { C_PointDir, T_Direction }   from  '@d_mdl/C_PointDir';

// 位置・経路を表すクラス全般
import { C_MovablePoint }            from '@d_mdl/C_MovablePoint';

// MAZE関係クラス全般
import { C_Maze }                    from '@d_mdl/C_Maze';
import { C_MazeInfo, JSON_MazeInfo } from '@d_mdl/C_MazeInfo'; // Maze作成のテンプレート情報

// パーティークラス全般
import { C_Team }         from '@d_mdl/C_Team';

// ヒーロークラス全般
import { C_Hero }         from '@d_mdl/C_Hero';

// セーブデータ(クライアントとの連携)全般
import { C_SaveData, JSON_SaveData } from '@d_mdl/C_SaveData';
import { C_Guild } from '@d_mdl/C_Guild';
import { _irand } from '@d_utl/F_Rand';
import { C_WndrObj } from '@d_mdl/C_WndrObj';
import { C_WndrObjBoss2, C_WndrObjBoss3 }  from '@d_mdl/C_WndrObjBoss';
import { C_MazeObjShadow } from '@d_mdl/C_MazeObjEtc';
import { _json_console } from '@d_utl/F_Utility';

/*******************************************************************************/
/*                                                                             */
/*                                 主　処　理                                   */
/*                                                                             */
/*******************************************************************************/

let gv: C_GlobalVar;
let ga: C_GlobalArguments;

interface I_GlobalArguments {
    mode?: string;
    nmbr?: number;
    pid?:  number;
    team?: string;
    maze?: string;
    maze_name?: string;
}

interface I_Return {
    ecode: number;
    emsg:  string;
    save?: JSON_SaveData;
    data?: object;
}

// Getting Information of All Maze
export function allMaze(obj: I_GlobalArguments): I_Return {
    init(obj);

    const maze_info_array: JSON_MazeInfo[] = [];
    for (const name in gv.mazeinfo) maze_info_array.push(gv.mazeinfo[name].encode());
    return all_encode(
        0, 
        {mazeinfo: maze_info_array},
    );
}

// Getting New Maze
export function getMaze(obj: I_GlobalArguments): I_Return {
    init(obj);

    const [new_maze, new_pos] = create_maze(ga.maze_name); 
    return all_encode(
        0, 
        {
            maze: new_maze.encode(),
            pos:  new_pos,
        },
    );
}

// Getting New Game startiing from Maze
export function newMaze(obj: I_GlobalArguments): I_Return {
    init(obj);

    const [new_maze, new_pos] = create_maze(''); 
    const  new_team = create_team(new_maze, new_pos); 
    const  new_guld = create_guld();

    const  new_save = create_save(new_maze, new_team, new_guld);
    const  ret_JSON = save_encode(0, new_save);
    return ret_JSON;
}


//////////////////////////////////////////////
///   サブルーチン
//////////////////////////////////////////////

function err_encode(code: number, msgs: string[]): I_Return {
    const ret_assoc: I_Return = {ecode:code, emsg: ''};
    for (const msg of msgs) ret_assoc.emsg += msg; 
    return ret_assoc;
}

function all_encode(code: number, data: object): I_Return {
    const ret_assoc: I_Return = {ecode:code, emsg: ''};

    ret_assoc.ecode = code;
    if (code !== 0 || gv.mes.is_err()) {
        return err_encode(code, gv.mes.get_err_messages());
    }
    ret_assoc.emsg = 'Status OK';
    ret_assoc.data =  data;

    return ret_assoc;
}

function save_encode(code: number, save: C_SaveData): I_Return {
    const ret_assoc: I_Return = {ecode:code, emsg: ''};

    if (code !== 0 || gv.mes.is_err()) {
        return err_encode(code, gv.mes.get_err_messages());
    }
    ret_assoc.emsg = 'Status OK';
    ret_assoc.save = save.encode();

    return ret_assoc;
}


function create_save(maze: C_Maze, team: C_Team, guld: C_Guild): C_SaveData {
    return new C_SaveData({
        player_id: ga.pid,
        auto_mode: '0',
        is_active: '1',
        is_delete: '0',

        all_team:  [team.encode()],
        all_maze:  [maze.encode()],
        all_guld:  [guld.encode()], 
        all_mvpt:  [], 

        mypos:     team.get_loc().encode(),
    });
}

function create_maze(maze_name: string = ''): [C_Maze, C_PointDir] {
    let maze: C_Maze;
    if (maze_name == '') {
        maze = new C_Maze({
            'name'  : '始まりの迷宮', 
            'size_x': 21, 
            'size_y': 21, 
            'size_z': gv.Max_of_Maze_Floor
        });
    } else {
        const mazeinfo = gv.mazeinfo[maze_name];
        maze = new C_Maze({
            'name':   mazeinfo.mbname, 
            'size_x': mazeinfo.size_x, 
            'size_y': mazeinfo.size_y, 
            'size_z': mazeinfo.size_z
        });
    }
    const z_max = maze.get_z_max()
    for (let i = 0; i < z_max; i++) {         // 各階層の迷宮を作成
        const pos = maze.create_maze(i);
    } 
    for (let i = 1; i < z_max; i++) {         // 各階層の階段を作成
        const pos  = maze.create_stair(i);
        const obje = new C_WndrObjBoss2({          // 中ボス設置
            pos:  {x:pos.dn?.x??0, y:pos.dn?.y??0, z:pos.dn?.z??0, d:0},
        });
        for (const wndr of obje.wres() ?? []) {
            wndr.random_make(); // ボスの装備をランダムに設定
        }
        maze.add_obj(obje);
    }

    const pos_btm = maze.create_stair(z_max); // 最下階の階段を作成
    const obje = new C_WndrObjBoss3({              // 大ボス設置
        pos:  {x:pos_btm.dn?.x??0, y:pos_btm.dn?.y??0, z:pos_btm.dn?.z??0, d:0},
    });
                                                          _json_console(obje.wres(), 'C_WndrObjBoss3.wres()');
    for (const wndr of obje.wres() ?? []) {
        wndr.random_make(); // ボスの装備をランダムに設定
    }
    maze.add_obj(obje);

    const pos_top = maze.create_stair(0);     // 最上階の階段を作成

    install_objs(maze, 3); // テスト用のオブジェクトを設置

    return [maze, pos_top.up];
}

// 迷宮探索 新規ゲーム用の暫定版処置。その二
function create_hres(): C_Hero[] {
    const hres: C_Hero[] = [];
    for (let i = 0; i <= 3; i++) {
        hres.push(new C_Hero().random_make());
    }

    return hres;
}

function create_team(maze: C_Maze, pos: C_PointDir): C_Team {
/*
    $x = 2 * random_int(0, (($maze->get_size_x() - 1) / 2) - 1) + 1;
    $y = 2 * random_int(0, (($maze->get_size_y() - 1) / 2) - 1) + 1;
    $z = 0;  //    $z = 1 * random_int(0,  ($gv->maze->get_size_z() - 1));

    $d = random_int(0, Direct::MAX);
*/
    const team = new C_Team();
    const loc  = new C_MovablePoint().decode({
        'kind'   : 'Maze',
        'name'   :  maze.get_name(),
        'loc_uid':  maze.uid(),
        'loc_pos':  pos,
        'team_uid': team.uid(),
        /*
        'loc_pos' => [
            'x'   => $x,
            'y'   => $y,
            'z'   => $z,
            'd'   => $d,
        ],
*/
    });


    team.set_prp({'name': 'ひよこさんチーム'});
    team.set_loc(loc);
    for (let i = 0; i <= 3; i++) {
        team.add_hero(new C_Hero().random_make());
    }

    return team;
}

function create_guld(): C_Guild {
    const guld = new C_Guild();
    guld.decode({name: '始まりの街の冒険者ギルド'});

    for (let i = 0; i < 12; i++) {
        guld.add_hero((new C_Hero()).random_make());
    }

    return guld;
}


// 暫定(C_MazeObjのテスト用)
function install_objs(maze: C_Maze, num: number = 1): void {
    if (num < 1) num = 1;
    if (num > 10) num = 10; // テスト用なので、最大10個まで
    
    // 通り抜けできないオブジェを置く（移動版）
    for (let i = 0; i < num; i++) {
        const x = _irand(0, (maze.get_x_max() - 1) / 2 - 1) * 2 + 1; 
        const y = _irand(0, (maze.get_y_max() - 1) / 2 - 1) * 2 + 1; 
        const z = _irand(0,  maze.get_z_max() - 1); // 0から最大階層まで

        const obje = new C_WndrObj({
            pos:    {x:x, y:y, z:z, d:0},
            walk: {
                cond: {canThru: "0",},
            },
            wres: [
                    { boss_level: 0, family: '雑魚', },
                    { boss_level: 0, family: '雑魚', },
                    { boss_level: 0, family: '雑魚', },
                    { boss_level: 0, family: '雑魚', },
            ],
        });

        for (const wndr of obje.wres() ?? []) {
            wndr.random_make(); // ボスの装備をランダムに設定
        }

        maze.add_obj(obje);
    }
    // 通り抜けできるオブジェを置く
    for (let i = 0; i < num; i++) {
        const x = _irand(0, (maze.get_x_max() - 1) / 2 - 1) * 2 + 1; 
        const y = _irand(0, (maze.get_y_max() - 1) / 2 - 1) * 2 + 1; 
        const z = _irand(0,  maze.get_z_max() - 1); // 0から最大階層まで

        const obj = new C_MazeObjShadow({
            pos:     {x:x, y:y, z:z, d:0},
        });
        maze.add_obj(obj);
    }
}


/*******************************************************************************/
/*                                                                             */
/*                                初　期　設　定                                */
/*                                                                             */
/*******************************************************************************/

function init(obj: I_GlobalArguments): void {
    gv = new C_GlobalVar();
    ga = new C_GlobalArguments(obj);
    return;
}

//////////////////////////////////////////////
/////
/////     クラス宣言
/////
//////////////////////////////////////////////

// 大域変数の設定
class C_GlobalVar {
    public mes: C_DspMessage;

    public mazeinfo: {[maze_name: string]: C_MazeInfo} = {};
//    public maze:     C_Maze;
    public team:     C_Team;
    public heroes:   C_Hero[] = [];

    public Maze_size_x       = 21;
    public Maze_size_y       = 21;
    public Limit_of_room     = 5;
    public Max_size_of_room  = 3;
    public Max_of_Maze_Floor = 3;

    public constructor() {
        this.mes = new C_DspMessage( /* isHTML = */ false);

        const mazeinfo = C_MazeInfo.get_tbl_all(); 
        for (const mi of mazeinfo) this.mazeinfo[mi.name] = mi; 
/*
        const [rslt, mazeinfo]  = C_MazeInfo.get_tbl_all();
        this.mazeinfo = (rslt !== undefined) ? mazeinfo : []; 
*/
/*
        this.maze        = new C_Maze().create_make({
            size_x:    this.Maze_size_x,
            size_y:    this.Maze_size_y,
            size_z:    this.Max_of_Maze_Floor, 
            fill_kind: T_MzKind.Empty,
            max_room:  this.Limit_of_room,
            room_size: this.Max_size_of_room,
    });
*/
        this.team        =  new C_Team({name: 'New Team', x:1, y:1, z:1, d:T_Direction.N});
    }
}


// POST引数の設定
class C_GlobalArguments {
    public mode:      string;
    public pid:       number   =  1;
    public maze_name: string   = '';

/*
    public team_JSON: string   = '';
    public maze_JSON: string   = '';
*/


    public constructor(obj: I_GlobalArguments) {
        this.mode      = obj?.mode ?? 'unknown';
        this.pid       = obj?.pid  !== undefined && !isNaN(obj.pid) ? Number(obj.pid) : 1;
        this.maze_name = obj?.maze_name ?? '';
/*
        this.team_JSON = obj?.team      ?? '';
        this.maze_JSON = obj?.maze      ?? '';
*/
    }
}
