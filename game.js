var app;

window.addEventListener('load', ()=>{ app = new ApplicationController(); });


class ApplicationController
{
    constructor()
    {
        this.model = new GridModel();
        this.view = new GridView();
        this.view.SetModel(this.model);
        this.view.update = this.update.bind(this);
    }

    update(direction)
    {
        this.model.update(direction);
        this.view.refresh();
    }

}

class GridModel
{
    constructor(v_size = 4, h_size = 4)
    {
        this.h_size = h_size;
        this.v_size = v_size;
        this.field = [];
        
        
        for(let y = 0; y < v_size; y++)
        {
            this.field[y] = [];
            for(let x = 0; x< h_size; x++)
                this.field[y][x] = 0; 
        }
        this.Spawn(2);
        
    }

    Spawn(amount)
    {
        let spawned = 0;
        while(spawned != amount)
        {
            for(let y = 0; y < this.v_size; y++)
                for(let x = 0; x< this.h_size; x++)
                {
                    if(spawned == amount)
                      return;
                    let chance = Math.random();
                    if (this.field[y][x] == 0 && chance > 0.7)
                    {
                        this.field[y][x] = (chance > 0.9)?4:2;
                        spawned++;
                    }


                }
            
        }
    }

    update(direction)
    {
        // check if shift direction is correct
        if(direction < 0 || direction > 3)
          return;

        
        let is_vertical = (direction == 0 || direction == 2);
        let is_positive = (direction == 0 || direction == 3);
        
        let changed = false;
        let size = (is_vertical)?this.v_size:this.h_size;
        for(let row = 0; row < size ; row++)
        {
          let line = this.ExtractLine(row,is_vertical);
          line = this.ShiftLine(line,is_positive);

          if(!this.is_equal(line,this.ExtractLine(row,is_vertical)))
          {
            changed = true;
          }
            

          this.PatchLine(row,is_vertical,line);

        }
        
        if(changed && this.is_active())
            this.Spawn(1);

    }

    is_active()
    {
        for(let y = 0; y < this.v_size; y++)
            for(let x = 0; x< this.h_size; x++)
              if(this.field[y][x] == 0)
                return true;
        return false;
    }

    is_equal(line1,line2)
    {
        if(line1.length != line2.length)
          return false;
        
        for(let index = 0; index < line1.length; index++)
          if( line1[index] != line2[index] )
            return false;

        return true;
    }

    ShiftLine(row,positive)
    {
        let result = [];

        let initial_size = row.length;
        let line = row.filter((item)=>{ return item != 0});

        let previous = 0;
        for(let index = 0;index < line.length;index++)
        {
            if(previous == line[index] )
            {
                result.pop();
                result.push(previous + line[index]);
                previous = 0;
            }else
            {
                previous = line[index];
                result.push(line[index]);
            }
            
        }

        let lefrover = [];
        for(let dif = result.length; dif< initial_size;dif++)
          lefrover.push(0);

        return (positive)?result.concat(lefrover):lefrover.concat(result);
  
    }

    ExtractLine(row,vertical)
    {
        let line = [];

        if(!vertical)
            line = this.field[row];
        else
        {
            for(let index = 0; index < this.v_size; index++)
                line.push(this.field[index][row]);
        }
        return  line;
    }

    PatchLine(row,vertical,line)
    {
        
        if(!vertical)
            this.field[row] = line;  
        else
        {
            for(let index = 0; index < this.v_size; index++)
                this.field[index][row] = line[index];
        }

    }

    GetCell(y,x)
    {
       return this.field[y][x];
    }

    SetCell(y,x,value)
    {
        this.field[y][x] = value;
    }

}

class GridView
{
    constructor(name)
    {
        this.colors = {
                       "0":"#968c81",
                       "2":"#ede4da",
                       "4":"#ecdfc7",
                       "8":"#f2b179",
                       "16":"#f59563",
                       "32":"#ecce71",
                       "64":"#ecc750",
                       "128":"#ecc440",
                       "512":"#ec4d58",
                       "512":"#ec4d60",
                       "1024":"#5da0de",
                       "2048":"#007cbe"
                      }

        this.keys = {"ArrowUp":0,"ArrowRight":1,"ArrowDown":2,"ArrowLeft":3};

        this.model = {};
        this.cells = [[],[],[],[]];
        let table = document.getElementById("game").children[0].children;
        for(let row = 0; row <table.length;row++)
        {
            for(let col = 0;col <table[row].children.length;col++)
            {
                this.cells[row][col] = table[row].children[col];
            }
        }
        this.update = ()=>{};
        document.onkeydown = this.keyEvent.bind(this);
    }

    keyEvent(key)
    {
        
        let direction = (this.keys[key.key] == undefined)?-1:this.keys[key.key]; 
        if(direction < 0)
          return;

        this.update(direction);
    }

    SetModel(model)
    {
        this.model = model;
        this.refresh();
    }

    refresh()
    {
        for(let row = 0; row<this.cells.length;row++)
          for(let col = 0; col<this.cells[0].length;col++)
          {
            let value = this.model.GetCell(row,col);
            this.cells[row][col].style.backgroundColor = this.colors[value];
            this.cells[row][col].innerText = (value ==0)?"":value;
          }
    }
}