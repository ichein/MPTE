//Convierte la lista de tokens en un AST. Cada nodo de marca de formato tiene children, igual que un elemento HTML 

function parse(tokens){
    const root = {kind:"root", children:[]};
    const stack = [root];
    function current_parent(){
        return stack[stack.length - 1];
    }
    for (const token of tokens){
        switch(token.kind){
            case "text":{
                current_parent().children.push({kind:"text", value:token.value});
                break;
            }
            case "OPEN": {
                const node ={kind: "mark", type: token.type, children:[]};
                current_parent().children.push(node);
                stack.push(node);
                break;
            }
            case "OPEN_PARAM":{
                const node ={
                    kind: "mark",
                    type: token.type,
                    param: token.value,
                    children:[]
                };
                current_parent().children.push(node);
                stack.push(node);
                break;
            }
            case "CLOSE":{
                if (current_parent().kind === "mark" && current_parent().type === token.type){
                    stack.pop();
                }else{}
                break;
                }
            }
        }
    return root;
}

module.exports = {parse};