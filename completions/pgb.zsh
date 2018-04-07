autoload -Uz compinit && autoload -Uz bashcompinit
compinit && bashcompinit

_pgb_complete() {
	COMPREPLY=()
	local word="${COMP_WORDS[COMP_CWORD]}"
	local args=""
	local COUNTER=1
  while [ $COUNTER -le $# ]; do 
		args="$args ${COMP_WORDS[$COUNTER]}"
		let COUNTER=COUNTER+1
	done
  local completions="$(pgb $args --completion idx=$((COMP_CWORD-1)) word=$word)"
	case $completions in
     '') # default
      complete -o default -o bashdefault -F _pgb_complete pgb
      ;;
    -x*) # disable completions
      complete -F _pgb_complete pgb 
      ;;
    -n*) # nospace
      COMPREPLY+=( $(compgen -W "${completions:3}" -- "$word") )
      complete -o nospace -F _pgb_complete pgb 
      ;;
      *) # use matches only
      COMPREPLY+=( $(compgen -W "$completions" -- "$word") )
      complete -F _pgb_complete pgb 
      ;;
  esac
}

complete -F _pgb_complete pgb